import 'mocha';
import * as chai from 'chai';
import { ConfigInferrer, Context } from './config-inferrer';
import { WorkspaceConfig } from './config';

function context(files: {[path:string]:string}): Context {
    return {

        config: {},

        async exists(path: string) {
            return path.toString() in files;
        },
        async getFullPath(path: string) {
            return path.toString();
        },
        async list(path: string) {
            return Object.keys(files).filter(c => c.startsWith(path.toString())).map(c => files[c]);
        },
        async read(path: string) {
            return files[path.toString()];
        },
    }
}

async function expect(files: {[path:string]:string}, config: WorkspaceConfig): Promise<void> {
    const cf = new ConfigInferrer();
    const result = await cf.getConfig(context(files));
    chai.assert.equal(JSON.stringify(result, null, '  '), JSON.stringify(config, null, '  '));
}

describe('config inferrer', () => {
    it('check node', 
        async () => expect({
            'yarn.lock': '',
            'package.json': `
                {
                    "scripts": {
                        "prepare": "yarn run clean && yarn run build",
                        "clean": "npx rimraf lib",
                        "build": "npx tsc",
                        "watch": "npx tsc -w"
                    }
                }
            `        
        },{
            tasks: [
                {
                    init: "yarn install && yarn run build",
                    command: "yarn run watch"
                }
            ]
        })
    ),
    it('[java] mvn wrapper', 
        async () => expect({
            'pom.xml': '',
            'mvnw': '' 
        },{
            tasks: [
                {
                    init: "./mvnw install -DskipTests=false"
                }
            ]
        })
    ),
    it('[java] mvn', 
        async () => expect({
            'pom.xml': ''
        },{
            tasks: [
                {
                    init: "mvn install -DskipTests=false"
                }
            ]
        })
    ),
    it('[java] gradle', 
        async () => expect({
            'build.gradle': '',
            'pom.xml': '' 
        },{
            tasks: [
                {
                    init: "gradle build"
                }
            ]
        })
    ),
    it('[java] gradle wrapper', 
        async () => expect({
            'build.gradle': '',
            'gradlew': '' 
        },{
            tasks: [
                {
                    init: "./gradlew build"
                }
            ]
        })
    ),
    it('[python] pip install', 
        async () => expect({
            'requirements.txt': ''
        },{
            tasks: [
                {
                    init: "pip install -r ./requirements.txt"
                }
            ]
        })
    ),
    it('[go] go install', 
        async () => expect({
            'go.mod': ''
        },{
            tasks: [
                {
                    init: "go get && go build ./... && go test ./...",
                    command: "go run"
                }
            ]
        })
    ),
    it('[rust] cargo', 
        async () => expect({
            'Cargo.toml': ''
        },{
            tasks: [
                {
                    init: "cargo build",
                    command: "cargo watch -x run"
                }
            ]
        })
    ),
    it('[make] make', 
        async () => expect({
            'Makefile': ''
        },{
            tasks: [
                {
                    init: "make"
                }
            ]
        })
    ),
    it('[make] cmake', 
        async () => expect({
            'CMakeLists.txt': ''
        },{
            tasks: [
                {
                    init: "cmake ."
                }
            ]
        })
    )
})