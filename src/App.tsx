import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { AuthProvider } from './hooks/useAuth';
import { PublicLayout } from './layouts/PublicLayout';
import { HomePage } from './pages/HomePage';
import { BooksPage } from './pages/BooksPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { JournalPage } from './pages/JournalPage';
import { JournalDetailPage } from './pages/JournalDetailPage';
import { PoetryPage } from './pages/PoetryPage';
import { PoemDetailPage } from './pages/PoemDetailPage';
import { AboutPage } from './pages/AboutPage';
import { NotesPage } from './pages/NotesPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminDashboard } from './admin/AdminDashboard';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Private Admin Route (never linked from public navigation) */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Public Literary Website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/books/:slug" element={<BookDetailPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/journal/:slug" element={<JournalDetailPage />} />
              <Route path="/poetry" element={<PoetryPage />} />
              <Route path="/poetry/:slug" element={<PoemDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MotionConfig>
  );
}
