import { useState, useEffect } from 'react';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

export default function TutorialView() {
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTutorial = async () => {
      setLoading(true);
      try {
        const filename = language === 'zh' ? 'tutorial-zh.md' : 'tutorial-en.md';
        const response = await fetch(`/${filename}`);
        const text = await response.text();

        // Fix media paths to work correctly
        const fixedText = text.replace(/\(media\//g, '(/media/');

        const html = md.render(fixedText);
        setContent(html);
      } catch (error) {
        console.error('Failed to load tutorial:', error);
        setContent('<h1>Failed to load tutorial</h1><p>Please check console for errors.</p>');
      } finally {
        setLoading(false);
      }
    };

    loadTutorial();
  }, [language]);

  const copyCode = (button: HTMLButtonElement) => {
    const codeBlock = button.parentElement?.querySelector('code');
    if (codeBlock) {
      navigator.clipboard.writeText(codeBlock.textContent || '');
      const originalText = button.textContent;
      button.textContent = '✓ Copied!';
      button.style.background = '#4caf50';
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
      }, 2000);
    }
  };

  useEffect(() => {
    // Add copy buttons to code blocks
    const preElements = document.querySelectorAll('.tutorial-content pre');
    preElements.forEach((pre) => {
      if (!pre.querySelector('.copy-button')) {
        const button = document.createElement('button');
        button.textContent = 'Copy';
        button.className = 'copy-button';
        button.onclick = () => copyCode(button);
        pre.appendChild(button);
      }
    });
  }, [content]);

  if (loading) {
    return (
      <div className="tutorial-view">
        <div className="tutorial-loading">Loading tutorial...</div>
      </div>
    );
  }

  return (
    <div className="tutorial-view">
      <div className="tutorial-header">
        <h1>Tutorial</h1>
        <div className="language-toggle">
          <button
            className={`lang-button ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            English
          </button>
          <button
            className={`lang-button ${language === 'zh' ? 'active' : ''}`}
            onClick={() => setLanguage('zh')}
          >
            中文
          </button>
        </div>
      </div>
      <div className="tutorial-content" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
