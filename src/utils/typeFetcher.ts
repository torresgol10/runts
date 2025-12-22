import { setupTypeAcquisition } from '@typescript/ata';
import typescript from 'typescript';

export const createTypeFetcher = (onDownloadFile: (code: string, path: string) => void) => {
    return setupTypeAcquisition({
        projectName: 'RunTS',
        typescript: typescript,
        logger: console,
        delegate: {
            receivedFile: (code, path) => {
                // Add to monaco using the callback
                onDownloadFile(code, path);
            },
        },
    });
};
