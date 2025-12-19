import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

export const getWebContainerInstance = async () => {
    if (webcontainerInstance) {
        return webcontainerInstance;
    }

    if (!bootPromise) {
        console.log('Booting WebContainer...');
        bootPromise = WebContainer.boot().then(instance => {
            console.log('WebContainer booted!');
            webcontainerInstance = instance;
            return instance;
        });
    }

    return bootPromise;
};

export const writeFile = async (path: string, content: string) => {
    const instance = await getWebContainerInstance();
    await instance.fs.writeFile(path, content);
};

export const readFile = async (path: string) => {
    const instance = await getWebContainerInstance();
    return await instance.fs.readFile(path, 'utf-8');
};
