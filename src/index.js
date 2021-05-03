import "@babel/polyfill";
import path from 'path'
import fs from 'fs'

const listFolder = (folder) => {
    const directoryPath = path.join(__dirname, folder);
    return new Promise((resolve, reject) => {
        fs.readdir(directoryPath, function (err, files) {
            if (err) {
                console.log('Could not scan dir');
                reject(err);
            }
            resolve(files);
        })
    })
}

const readFile = (file, folder) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, `${folder}/${file}`), 'utf8', function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    })
}

const writeFile = (content, fileName) => {
    try {
        fs.writeFileSync(path.join(__dirname, `${fileName}`), content)
    } catch (err) {
        console.error(err)
    }
}

const processFiles = async (folder, files) => {
    let data = []
    for (let i = 0; i < files.length; i++) {
        let result = await readFile(files[i], folder);
        data.push({ file: files[i], json: JSON.parse(result) })
    }
    return data
}

const processData = (data, output) => {
    let json = data.json;
    if (!output.auth_module[json.provider.auth_module]) {
        output.auth_module[json.provider.auth_module] = []
    }
    if (!output.content_module[json.provider.content_module]) {
        output.content_module[json.provider.content_module] = []
    }
    output.auth_module[json.provider.auth_module].push(`./${data.file}`)
    output.content_module[json.provider.content_module].push(`./${data.file}`)

}


const parte1 = (data) => {
    let output = {
        auth_module: {},
        content_module: {}
    };
    data.forEach((line) => {
        processData(line, output);
    });

    console.log("*************************PARTE1*************************")
    console.log(output);
    console.log("*************************PARTE1*************************")
    writeFile(JSON.stringify(output), 'parte1.txt')

}


const parte2 = (data) => {
    let groupSet = getGroups(data)
    let chosen = {}
    let users = []
    while (groupSet.size > 0) {
        let x = bestUserNotChosen(data, chosen, groupSet)
        users.push(`./${x.name}`)
        chosen[x.name] = {}
        removeGroup(x.content_module, groupSet)
        removeGroup(x.auth_module, groupSet)
    }
    console.log("*************************PARTE2*************************")
    console.log(users)
    console.log("*************************PARTE2*************************")
    writeFile(JSON.stringify(users), 'parte2.txt')
}

const bestUserNotChosen = (data, chosen, groupSet) => {
    let best = null
    for (let i = 0; i < data.length; i++) {
        const user = data[i]
        if (!chosen[user.file]) {
            let hits = 0
            if (groupSet.has(user.json.provider.content_module)) {
                hits++
            }
            if (groupSet.has(user.json.provider.auth_module)) {
                hits++
            }
            const elem = { name: user.file, content_module: user.json.provider.content_module, auth_module: user.json.provider.auth_module, hits: hits }
            if (!best || elem.hits > best.hits) {
                best = elem
            }
        }
    }
    return best
}


const removeGroup = (group, userSet) => {
    userSet.delete(group)
}

const getGroups = (data) => {
    let groups = new Set()
    data.forEach((elem) => {
        groups.add(elem.json.provider.content_module)
        groups.add(elem.json.provider.auth_module)

    })
    return groups
}


(async () => {

    try {
        let folder = 'data';
        let files = await listFolder(folder);
        let data = await processFiles(folder, files);

        parte1(data);
        parte2(data)
    } catch (e) {
        console.log("Error:", e.message)
    }
})()


