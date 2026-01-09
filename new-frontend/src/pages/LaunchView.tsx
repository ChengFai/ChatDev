import { useState, useEffect, useRef } from 'react';
import CollapsibleMessage from '../components/CollapsibleMessage';

interface Message {
  id: string;
  type: 'notification' | 'dialogue' | 'loading';
  content: string;
  timestamp: number;
  sender?: string;
}

export default function LaunchView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulated WebSocket connection (placeholder)
  useEffect(() => {
    // In a real implementation, this would connect to WebSocket
    // For now, just show a placeholder message
    setSessionId(`session-${Date.now()}`);
    setIsConnected(false);

    setMessages([
      {
        id: '1',
        type: 'notification',
        content: 'WebSocket integration pending. This is a placeholder for the Launch View.',
        timestamp: Date.now(),
      },
      {
        id: '2',
        type: 'notification',
        content:
          'The full LaunchView implementation requires WebSocket connection to the backend for real-time workflow execution monitoring.',
        timestamp: Date.now() + 1000,
      },
    ]);
  }, []);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="launch-view">
      <div className="launch-header">
        <h1>Launch & Monitor</h1>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">{isConnected ? 'Connected' : 'Disconnected'}</span>
          {sessionId && <span className="session-id">Session: {sessionId}</span>}
        </div>
      </div>

      <div className="launch-content">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="messages-empty">No messages yet. Start a workflow to see execution logs.</div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`message message-${message.type}`}>
                <div className="message-header">
                  <span className="message-sender">{message.sender || 'System'}</span>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
                <div className="message-body">
                  <CollapsibleMessage content={message.content} maxHeight={300} />
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="launch-info">
        <p>
          <strong>Note:</strong> Full WebSocket integration with real-time workflow execution monitoring is
          pending implementation.
        </p>
        <p>This view will display:</p>
        <ul>
          <li>Real-time execution logs</li>
          <li>Agent conversations and decisions</li>
          <li>Generated artifacts (files, images, etc.)</li>
          <li>Workflow status and progress</li>
        </ul>
      </div>
    </div>
  );
}
