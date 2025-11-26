/**
 * Template Form Component (Create/Edit)
 */

import { useState, useEffect, useRef } from 'react';
import { emailTemplateService } from '../../services/emailTemplateService';
import type { EmailTemplate, EmailTemplateCreate, EmailTemplateUpdate, TemplateVariable } from '../../types/emailTemplate';

interface TemplateFormProps {
  template: EmailTemplate | null;
  onSave: (data: EmailTemplateCreate | EmailTemplateUpdate) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export const TemplateForm = ({ template, onSave, onCancel, isSaving }: TemplateFormProps) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Variable insertion
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [variableCategories, setVariableCategories] = useState<string[]>([]);
  const [isVariableMenuOpen, setIsVariableMenuOpen] = useState(false);
  const [isSubjectVariableMenuOpen, setIsSubjectVariableMenuOpen] = useState(false);
  const bodyEditorRef = useRef<HTMLDivElement>(null);
  const subjectInputRef = useRef<HTMLInputElement>(null);

  // Load template data if editing
  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      setBody(template.body);
      setDescription(template.description || '');
      // Update editor content
      if (bodyEditorRef.current && bodyEditorRef.current.innerHTML !== template.body) {
        bodyEditorRef.current.innerHTML = template.body;
      }
    } else {
      setName('');
      setSubject('');
      setBody('');
      setDescription('');
      // Clear editor content
      if (bodyEditorRef.current && bodyEditorRef.current.innerHTML !== '') {
        bodyEditorRef.current.innerHTML = '';
      }
    }
  }, [template]);

  // Sync body state with editor content (only when body changes externally)
  useEffect(() => {
    if (bodyEditorRef.current && bodyEditorRef.current.innerHTML !== body) {
      const cursorPos = saveCursorPosition();
      bodyEditorRef.current.innerHTML = body;
      if (cursorPos !== null) {
        setTimeout(() => restoreCursorPosition(cursorPos), 0);
      }
    }
  }, [body]);

  // Load template variables
  useEffect(() => {
    const loadVariables = async () => {
      try {
        const data = await emailTemplateService.getTemplateVariables();
        setVariables(data.variables);
        setVariableCategories(data.categories);
      } catch (err) {
        console.error('Failed to load template variables:', err);
      }
    };
    loadVariables();
  }, []);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Template name is required');
      return;
    }

    if (!subject.trim()) {
      alert('Email subject is required');
      return;
    }

    if (!body.trim()) {
      alert('Email body is required');
      return;
    }

    const formData: EmailTemplateCreate | EmailTemplateUpdate = template
      ? {
          subject,
          body,
          description: description || null,
        }
      : {
          name: name.trim(),
          subject,
          body,
          description: description || null,
        };

    onSave(formData);
  };

  // Insert variable into editor
  const insertVariable = (variable: TemplateVariable) => {
    if (!bodyEditorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // No selection, insert at the end
      bodyEditorRef.current.innerHTML += variable.jinja2_syntax;
    } else {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(variable.jinja2_syntax);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Update body state
    setBody(bodyEditorRef.current.innerHTML);
    setIsVariableMenuOpen(false);
  };

  // Insert variable into subject
  const insertVariableToSubject = (variable: TemplateVariable) => {
    if (!subjectInputRef.current) return;
    
    const input = subjectInputRef.current;
    const cursorPos = input.selectionStart || subject.length;
    const newSubject = subject.slice(0, cursorPos) + variable.jinja2_syntax + subject.slice(cursorPos);
    setSubject(newSubject);
    setIsSubjectVariableMenuOpen(false);
    
    // Restore cursor position
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(cursorPos + variable.jinja2_syntax.length, cursorPos + variable.jinja2_syntax.length);
    }, 0);
  };

  // Sample data for preview
  const getSampleData = () => {
    const sampleData: Record<string, string> = {
      company_name: 'ABC회사',
      company_email: 'contact@abc.com',
      company_phone: '02-1234-5678',
      company_address: '서울시 강남구',
      sender_name: '식스티페이 팀',
      sender_email: 'noreply@sixtypay.com',
      current_date: new Date().toLocaleDateString('ko-KR'),
      logo_url: 'https://via.placeholder.com/200x50',
    };

    // Add all variables with example values
    variables.forEach((variable) => {
      if (variable.example_value) {
        sampleData[variable.name] = variable.example_value;
      }
    });

    return sampleData;
  };

  // Render preview
  const renderPreview = () => {
    const sampleData = getSampleData();
    let previewSubject = subject;
    let previewBody = body;

    // Replace variables in subject
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      previewSubject = previewSubject.replace(regex, value);
    });

    // Replace variables in body
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      previewBody = previewBody.replace(regex, value);
    });

    return (
      <div style={{ padding: '1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--text-color)',
          }}>
            Subject:
          </label>
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: 'var(--text-color)',
          }}>
            {previewSubject || '(No subject)'}
          </div>
        </div>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--text-color)',
          }}>
            Body:
          </label>
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              minHeight: '400px',
            }}
            dangerouslySetInnerHTML={{ __html: previewBody || '(No content)' }}
          />
        </div>
      </div>
    );
  };

  // Save cursor position
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !bodyEditorRef.current) return null;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(bodyEditorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  };

  // Restore cursor position
  const restoreCursorPosition = (position: number) => {
    if (!bodyEditorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection) return;
    
    const range = document.createRange();
    let charCount = 0;
    const nodeStack: Node[] = [bodyEditorRef.current];
    let node: Node | undefined;
    let foundStart = false;
    
    while (!foundStart && (node = nodeStack.pop())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharCount = charCount + (node.textContent?.length || 0);
        if (position <= nextCharCount) {
          range.setStart(node, position - charCount);
          range.setEnd(node, position - charCount);
          foundStart = true;
        }
        charCount = nextCharCount;
      } else {
        let i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i] as Node);
        }
      }
    }
    
    if (foundStart) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Formatting functions for contentEditable
  const formatText = (command: string, value?: string) => {
    const cursorPos = saveCursorPosition();
    document.execCommand(command, false, value);
    if (bodyEditorRef.current) {
      setBody(bodyEditorRef.current.innerHTML);
      if (cursorPos !== null) {
        setTimeout(() => restoreCursorPosition(cursorPos), 0);
      }
    }
    bodyEditorRef.current?.focus();
  };

  // Handle body content change
  const handleBodyChange = () => {
    if (bodyEditorRef.current) {
      const cursorPos = saveCursorPosition();
      const newContent = bodyEditorRef.current.innerHTML;
      setBody(newContent);
      
      // Restore cursor position after state update
      if (cursorPos !== null) {
        setTimeout(() => {
          restoreCursorPosition(cursorPos);
        }, 0);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Template Name (only for create) */}
        {!template && (
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-color)',
            }}>
              Template Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., factoring_service"
              required
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
              }}
            />
          </div>
        )}

        {/* Description */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--text-color)',
          }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Template description..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.625rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Email Subject */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}>
            <label style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-color)',
            }}>
              Email Subject <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsSubjectVariableMenuOpen(!isSubjectVariableMenuOpen)}
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                }}
              >
                Insert Variable
              </button>
              {isSubjectVariableMenuOpen && (
                <>
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 100,
                    }}
                    onClick={() => setIsSubjectVariableMenuOpen(false)}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    maxHeight: '400px',
                    overflow: 'auto',
                    zIndex: 101,
                    minWidth: '300px',
                  }}>
                    {variableCategories.map((category) => {
                      const categoryVariables = variables.filter((v) => v.category === category);
                      return (
                        <div key={category} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <div style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: 'var(--hover-bg)',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            color: 'var(--text-color)',
                          }}>
                            {category}
                          </div>
                          {categoryVariables.map((variable) => (
                            <button
                              key={variable.name}
                              type="button"
                              onClick={() => insertVariableToSubject(variable)}
                              style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                color: 'var(--text-color)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <div style={{ fontWeight: '500' }}>{variable.display_name}</div>
                              <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                                marginTop: '0.25rem',
                              }}>
                                {variable.jinja2_syntax}
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
            <input
            ref={subjectInputRef}
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., {{ company_name }}님, 식스티페이 서비스 안내"
            required
            style={{
              width: '100%',
              padding: '0.625rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
            }}
          />
        </div>

        {/* Tabs */}
        <div>
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '1rem',
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === 'editor' ? 'var(--card-bg)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'editor' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: activeTab === 'editor' ? '600' : '400',
                color: activeTab === 'editor' ? '#2563eb' : 'var(--text-secondary)',
              }}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === 'preview' ? 'var(--card-bg)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'preview' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: activeTab === 'preview' ? '600' : '400',
                color: activeTab === 'preview' ? '#2563eb' : 'var(--text-secondary)',
              }}
            >
              Preview
            </button>
          </div>

          {activeTab === 'editor' ? (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}>
                <label style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-color)',
                }}>
                  Email Body <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setIsVariableMenuOpen(!isVariableMenuOpen)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                    }}
                  >
                    Insert Variable
                  </button>
                  {isVariableMenuOpen && (
                    <>
                      <div
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: 100,
                        }}
                        onClick={() => setIsVariableMenuOpen(false)}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        maxHeight: '400px',
                        overflow: 'auto',
                        zIndex: 101,
                        minWidth: '300px',
                      }}>
                        {variableCategories.map((category) => {
                          const categoryVariables = variables.filter((v) => v.category === category);
                          return (
                            <div key={category} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <div style={{
                                padding: '0.75rem 1rem',
                                backgroundColor: 'var(--hover-bg)',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                color: 'var(--text-color)',
                              }}>
                                {category}
                              </div>
                              {categoryVariables.map((variable) => (
                                <button
                                  key={variable.name}
                                  type="button"
                                  onClick={() => insertVariable(variable)}
                                  style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    color: 'var(--text-color)',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <div style={{ fontWeight: '500' }}>{variable.display_name}</div>
                                  <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)',
                                    marginTop: '0.25rem',
                                  }}>
                                    {variable.jinja2_syntax}
                                  </div>
                                </button>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
              }}>
                {/* Toolbar */}
                <div style={{
                  display: 'flex',
                  gap: '0.25rem',
                  padding: '0.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: '#f9fafb',
                  flexWrap: 'wrap',
                }}>
                  <button
                    type="button"
                    onClick={() => formatText('bold')}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                    }}
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('italic')}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontStyle: 'italic',
                    }}
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('underline')}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      textDecoration: 'underline',
                    }}
                    title="Underline"
                  >
                    U
                  </button>
                  <div style={{ width: '1px', backgroundColor: 'var(--border-color)', margin: '0 0.25rem' }} />
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Enter URL:');
                      if (url) formatText('createLink', url);
                    }}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                    title="Insert Link"
                  >
                    🔗
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('insertUnorderedList')}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                    title="Bullet List"
                  >
                    •
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('insertOrderedList')}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                    title="Numbered List"
                  >
                    1.
                  </button>
                  <div style={{ width: '1px', backgroundColor: 'var(--border-color)', margin: '0 0.25rem' }} />
                  <button
                    type="button"
                    onClick={() => formatText('formatBlock', '<p>')}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                    title="Paragraph"
                  >
                    P
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('formatBlock', '<h1>')}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                    }}
                    title="Heading 1"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('formatBlock', '<h2>')}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                    }}
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('formatBlock', '<h3>')}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                    }}
                    title="Heading 3"
                  >
                    H3
                  </button>
                </div>
                {/* Editor */}
                <div
                  ref={bodyEditorRef}
                  contentEditable
                  onInput={handleBodyChange}
                  onBlur={handleBodyChange}
                  suppressContentEditableWarning
                  style={{
                    minHeight: '400px',
                    padding: '1rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                    outline: 'none',
                    color: '#111827',
                  }}
                />
              </div>
            </div>
          ) : (
            renderPreview()
          )}
        </div>

        {/* Form Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </div>
    </form>
  );
};

