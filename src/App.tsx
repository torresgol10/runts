import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Playground } from './pages/Playground';

function App() {
    return (
        <BrowserRouter basename="/playground">
            <Routes>
                <Route path="/" element={<Playground />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
