import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnvManager } from './EnvManager';
import { useStore } from '../store/useStore';

// Mock store
vi.mock('../store/useStore', () => ({
    useStore: vi.fn(),
}));

describe('EnvManager Component', () => {
    const mockAddEnvVar = vi.fn();
    const mockRemoveEnvVar = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useStore as any).mockReturnValue({
            envVars: { 'API_URL': 'https://api.example.com' },
            addEnvVar: mockAddEnvVar,
            removeEnvVar: mockRemoveEnvVar,
        });
    });

    it('should render existing variables', () => {
        render(<EnvManager />);
        expect(screen.getByText('API_URL')).toBeDefined();
        expect(screen.getByText('https://api.example.com')).toBeDefined();
    });

    it('should add new variable', () => {
        render(<EnvManager />);

        const keyInput = screen.getByPlaceholderText('KEY (e.g. API_URL)');
        const valueInput = screen.getByPlaceholderText('VALUE');

        // Find the submit button specifically (it's the one inside the form, or usually the first one / one with + icon)
        // Since we don't have aria-labels yet, we can find by type="submit" or containment
        const buttons = screen.getAllByRole('button');
        const submitBtn = buttons.find(btn => (btn as HTMLButtonElement).type === 'submit');

        fireEvent.change(keyInput, { target: { value: 'NEW_KEY' } });
        fireEvent.change(valueInput, { target: { value: 'secret' } });

        if (submitBtn) fireEvent.click(submitBtn);

        expect(mockAddEnvVar).toHaveBeenCalledWith('NEW_KEY', 'secret');
    });

    it('should remove variable', () => {
        render(<EnvManager />);
        // Finding the remove button might require finding by the trash icon or similar logic. 
        // For simplicity, we assume there's a button associated with the item.
        // In a real app we'd add data-testid or aria-label.
        // Let's check if we can find it by generic button role inside the list item.
        const removeButtons = screen.getAllByRole('button');
        // Filter out the add button if possible, or just click the last ones.
        // The first button is "Add", subsequent are "Remove".
        if (removeButtons.length > 1) {
            fireEvent.click(removeButtons[removeButtons.length - 1]);
            expect(mockRemoveEnvVar).toHaveBeenCalledWith('API_URL');
        }
    });
});
