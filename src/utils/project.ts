import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ProjectFile {
    name: string;
    content: string;
}

export const downloadProjectZip = async (files: ProjectFile[]) => {
    const zip = new JSZip();

    files.forEach(file => {
        let fileName = file.name;
        // Ensure extension
        if (!fileName.endsWith('.ts') && !fileName.endsWith('.js') && !fileName.endsWith('.json')) {
            fileName += '.ts';
        }
        zip.file(fileName, file.content);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'runts-project.zip');
};
