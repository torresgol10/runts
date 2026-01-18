import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock functions declared inside the factory to avoid hoisting issues
vi.mock('../../webcontainer/instance', () => {
    const mockWriteFile = vi.fn();
    return {
        getWebContainerInstance: vi.fn(() => Promise.resolve({
            mount: vi.fn().mockResolvedValue(undefined),
            spawn: vi.fn().mockResolvedValue({
                output: { pipeTo: vi.fn() },
                exit: Promise.resolve(0),
                kill: vi.fn()
            }),
            fs: {
                readFile: vi.fn().mockResolvedValue(JSON.stringify({ dependencies: {} })),
                writeFile: mockWriteFile
            }
        })),
        writeFile: mockWriteFile
    };
});

describe('WebContainerService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should be importable', async () => {
        const { WebContainerService } = await import('../../services/WebContainerService');
        expect(WebContainerService).toBeDefined();
    });

    it('should create an instance', async () => {
        const { WebContainerService } = await import('../../services/WebContainerService');
        const service = new WebContainerService();
        expect(service).toBeDefined();
        expect(typeof service.boot).toBe('function');
        expect(typeof service.runCode).toBe('function');
        expect(typeof service.kill).toBe('function');
    });

    it('should call boot without errors', async () => {
        const { WebContainerService } = await import('../../services/WebContainerService');
        const service = new WebContainerService();

        await expect(service.boot({ lodash: '^4.0.0' })).resolves.toBeDefined();
    });

    it('should call refreshDependencies and return object', async () => {
        const { WebContainerService } = await import('../../services/WebContainerService');
        const service = new WebContainerService();

        const deps = await service.refreshDependencies();
        expect(typeof deps).toBe('object');
    });
});
