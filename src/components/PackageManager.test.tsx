import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PackageManager } from './PackageManager';
import { useStore } from '../store/useStore';

vi.mock('../store/useStore', () => ({
    useStore: vi.fn(),
}));

describe('PackageManager Component', () => {
    const mockInstallPackage = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        vi.clearAllMocks();
        (useStore as any).mockReturnValue({
            dependencies: { 'lodash': '4.17.21' },
            installPackage: mockInstallPackage,
        });
    });

    it('should render installed packages', () => {
        render(<PackageManager />);
        expect(screen.getByText('lodash')).toBeDefined();
        expect(screen.getByText('4.17.21')).toBeDefined();
    });

    it('should trigger install on form submit', () => {
        render(<PackageManager />);
        const input = screen.getByPlaceholderText('Package name...');
        const submitBtn = screen.getByRole('button', { name: '' }); // Download icon

        fireEvent.change(input, { target: { value: 'dayjs' } });
        fireEvent.click(submitBtn);

        expect(mockInstallPackage).toHaveBeenCalledWith('dayjs');
    });
});
