const { useState } = React;
const { Calendar, Plus, Mic, Settings, ChevronLeft, ChevronRight } = lucideReact;

const AIMobileCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Team standup",
      date: new Date(2025, 8, 10, 9, 0),
      category: "work",
      color: "#3b82f6"
    },
    {
      id: 2,
      title: "Lunch with Sarah",
      date: new Date(2025, 8, 12, 12, 30),
      category: "personal",
      color: "#10b981"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editCategory, setEditCategory] = useState('personal');
  const [showSettings, setShowSettings] = useState(false);
  const [categories, setCategories] = useState({
    work: "#3b82f6",
    personal: "#10b981",
    health: "#f59e0b",
    social: "#8b5cf6"
  });
  const [tempCategories, setTempCategories] = useState({});
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [tempBackgroundColor, setTempBackgroundColor] = useState('#ffffff');
  const [tempTextColor, setTempTextColor] = useState('#000000');

  const parseNaturalLanguage = (text) => {
    const now = new Date();
    let eventDate = new Date(now);
    let eventTime = null;
    let title = text;
    let category = "personal";

    const timeRegex = /(\d{1,2}):?(\d{0,2})\s*(am|pm|AM|PM)?/;
    const timeMatch = text.match(timeRegex);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      let minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const ampm = timeMatch[3]?.toLowerCase();

      if (ampm === 'pm' && hours !== 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;

      eventTime = { hours, minutes };
    }

    const today = new Date(now);
    if (text.includes('tomorrow')) {
      eventDate.setDate(today.getDate() + 1);
    } else if (text.includes('next monday')) {
      const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
      eventDate.setDate(today.getDate() + daysUntilMonday);
    } else if (text.includes('next tuesday')) {
      const daysUntilTuesday = (9 - today.getDay()) % 7 || 7;
      eventDate.setDate(today.getDate() + daysUntilTuesday);
    } else if (text.includes('next week')) {
      eventDate.setDate(today.getDate() + 7);
    }

    if (eventTime) {
      eventDate.setHours(eventTime.hours, eventTime.minutes, 0, 0);
    }

    if (text.includes('meeting') || text.includes('work') || text.includes('boss') || text.includes('client')) {
      category = 'work';
    } else if (text.includes('doctor') || text.includes('gym') || text.includes('workout')) {
      category = 'health';
    } else if (text.includes('party') || text.includes('friends') || text.includes('dinner out')) {
      category = 'social';
    }

    title = text
      .replace(/at \d{1,2}:?\d{0,2}\s*(am|pm)?/i, '')
      .replace(/next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, '')
      .replace(/tomorrow/i, '')
      .replace(/next week/i, '')
      .trim();

    return {
      title: title || 'New Event',
      date: eventDate,
      category,
      color: categories[category]
    };
  };

  const addEvent = () => {
    if (inputText.trim()) {
      const parsedEvent = parseNaturalLanguage(inputText);
      const newEvent = {
        id: Date.now(),
        ...parsedEvent
      };
      setEvents([...events, newEvent]);
      setInputText('');
      setShowInput(false);
    }
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setEditTitle(event.title);
    setEditDate(event.date.toISOString().split('T')[0]);
    setEditTime(event.date.toTimeString().slice(0, 5));
    setEditCategory(event.category);
  };

  const saveEditedEvent = () => {
    if (editTitle.trim() && editingEvent) {
      const updatedDate = new Date(`${editDate}T${editTime}`);
      const updatedEvent = {
        ...editingEvent,
        title: editTitle,
        date: updatedDate,
        category: editCategory,
        color: categories[editCategory]
      };

      setEvents(events.map(event =>
        event.id === editingEvent.id ? updatedEvent : event
      ));
      closeEditModal();
    }
  };

  const deleteEvent = () => {
    if (editingEvent) {
      setEvents(events.filter(event => event.id !== editingEvent.id));
      closeEditModal();
    }
  };

  const closeEditModal = () => {
    setEditingEvent(null);
    setEditTitle('');
    setEditDate('');
    setEditTime('');
    setEditCategory('personal');
  };

  const openSettings = () => {
    setTempCategories({ ...categories });
    setTempBackgroundColor(backgroundColor);
    setTempTextColor(textColor);
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
    setTempCategories({});
  };

  const saveSettings = () => {
    setCategories({ ...tempCategories });
    setBackgroundColor(tempBackgroundColor);
    setTextColor(tempTextColor);
    setEvents(events.map(event => ({
      ...event,
      color: tempCategories[event.category]
    })));
    closeSettings();
  };

  const updateTempColor = (category, color) => {
    setTempCategories(prev => ({
      ...prev,
      [category]: color
    }));
  };

  const resetToDefaults = () => {
    const defaultColors = {
      work: "#3b82f6",
      personal: "#10b981",
      health: "#f59e0b",
      social: "#8b5cf6"
    };
    setTempCategories({ ...defaultColors });
    setTempBackgroundColor('#ffffff');
    setTempTextColor('#000000');
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event =>
      event.date.toDateString() === targetDate.toDateString()
    );
  };

  const formatMonth = (date) => {
    const monthNames = {
      0: 'JAN', 1: 'FEB', 2: 'MAR', 3: 'APR', 4: 'MAY', 5: 'JUN',
      6: 'JUL', 7: 'AUG', 8: 'SEP', 9: 'OCT', 10: 'NOV', 11: 'DEC'
    };
    const monthName = monthNames[date.getMonth()];
    return `${monthName} ${date.getFullYear()}`;
  };

  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    } else if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const getWeekStart = (date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    return start;
  };

  const getWeekDays = (date) => {
    const weekStart = getWeekStart(date);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getHoursArray = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    return hours;
  };

  const formatTime = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const getEventsForDate = (date) => {
    return events.filter(event =>
      event.date.toDateString() === date.toDateString()
    ).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const getViewTitle = () => {
    const monthNames = {
      0: 'JAN', 1: 'FEB', 2: 'MAR', 3: 'APR', 4: 'MAY', 5: 'JUN',
      6: 'JUL', 7: 'AUG', 8: 'SEP', 9: 'OCT', 10: 'NOV', 11: 'DEC'
    };

    if (viewMode === 'day') {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const monthName = monthNames[currentDate.getMonth()];
      return `${dayName} ${monthName} ${currentDate.getDate()} ${currentDate.getFullYear()}`;
    } else if (viewMode === 'week') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      if (weekStart.getMonth() === weekEnd.getMonth()) {
        const monthName = monthNames[weekStart.getMonth()];
        return `${monthName} ${weekStart.getDate()}-${weekEnd.getDate()} ${weekStart.getFullYear()}`;
      } else {
        const startMonth = monthNames[weekStart.getMonth()];
        const endMonth = monthNames[weekEnd.getMonth()];
        return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()} ${weekStart.getFullYear()}`;
      }
    } else {
      return formatMonth(currentDate);
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);

  return React.createElement('div', {
    className: "max-w-md mx-auto min-h-screen",
    style: { backgroundColor, color: textColor }
  },
    React.createElement('div', {
      className: "px-6 py-6 border-b border-gray-300",
      style: {
        backgroundColor: backgroundColor === '#ffffff' ? '#f5f5f5' : backgroundColor,
        color: textColor
      }
    },
      React.createElement('div', { className: "flex items-center justify-between" },
        React.createElement('div', { className: "flex items-center space-x-3" },
          React.createElement(Calendar, {
            className: "w-7 h-7",
            style: { color: textColor }
          }),
          React.createElement('h1', {
            className: "text-2xl font-black tracking-wide",
            style: { color: textColor }
          }, "CALENDAR")
        ),
        React.createElement(Settings, {
          className: "w-6 h-6 cursor-pointer hover:opacity-70 transition-opacity",
          style: { color: textColor },
          onClick: openSettings
        })
      )
    ),

    React.createElement('div', {
      className: "flex items-center justify-between px-6 py-6 border-b border-gray-300",
      style: {
        backgroundColor: textColor,
        color: backgroundColor
      }
    },
      React.createElement('button', {
        onClick: () => navigate(-1),
        className: "p-3 hover:opacity-70 rounded-full transition-opacity"
      },
        React.createElement(ChevronLeft, {
          className: "w-6 h-6",
          style: { color: backgroundColor }
        })
      ),
      React.createElement('h2', {
        className: "text-3xl font-black uppercase tracking-wider",
        style: {
          fontStretch: 'condensed',
          letterSpacing: '0.1em',
          color: backgroundColor
        }
      }, getViewTitle()),
      React.createElement('button', {
        onClick: () => navigate(1),
        className: "p-3 hover:opacity-70 rounded-full transition-opacity"
      },
        React.createElement(ChevronRight, {
          className: "w-6 h-6",
          style: { color: backgroundColor }
        })
      )
    ),

    React.createElement('div', {
      className: "flex mx-6 my-6 rounded-2xl p-2 border border-gray-300",
      style: { backgroundColor }
    },
      ['month', 'week', 'day'].map(mode =>
        React.createElement('button', {
          key: mode,
          onClick: () => setViewMode(mode),
          className: "flex-1 py-4 px-6 text-lg font-black rounded-xl transition-all uppercase tracking-wider",
          style: {
            backgroundColor: viewMode === mode ? textColor : 'transparent',
            color: viewMode === mode ? backgroundColor : textColor
          }
        }, mode)
      )
    ),

    React.createElement('div', {
      className: "flex-1 overflow-auto",
      style: { backgroundColor }
    },
      viewMode === 'month' && React.createElement(React.Fragment, null,
        React.createElement('div', {
          className: "grid grid-cols-7 border-b border-gray-300",
          style: {
            backgroundColor: backgroundColor === '#ffffff' ? '#f5f5f5' : backgroundColor
          }
        },
          weekDays.map(day =>
            React.createElement('div', {
              key: day,
              className: "p-4 text-center text-sm font-bold uppercase tracking-widest",
              style: { color: textColor }
            }, day)
          )
        ),
        React.createElement('div', {
          className: "grid grid-cols-7",
          style: { backgroundColor }
        },
          days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day &&
              new Date().toDateString() ===
              new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return React.createElement('div', {
              key: index,
              className: "border-b border-r border-gray-300 min-h-[100px] p-3 hover:opacity-70 transition-opacity"
            },
              day && React.createElement(React.Fragment, null,
                React.createElement('div', {
                  className: `text-lg font-black mb-2 ${isToday ? 'w-8 h-8 rounded-full flex items-center justify-center' : ''}`,
                  style: {
                    color: isToday ? backgroundColor : textColor,
                    backgroundColor: isToday ? textColor : 'transparent'
                  }
                }, day),
                React.createElement('div', { className: "space-y-1" },
                  dayEvents.map(event =>
                    React.createElement('div', {
                      key: event.id,
                      onClick: () => openEditModal(event),
                      className: "text-xs p-2 rounded-lg text-white font-bold truncate cursor-pointer hover:opacity-80 transition-opacity border border-gray-400",
                      style: { backgroundColor: event.color }
                    },
                      event.date.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      }) + ' ' + event.title
                    )
                  )
                )
              )
            );
          })
        )
      ),

      viewMode === 'week' && React.createElement('div', {
        className: "flex flex-col",
        style: { backgroundColor }
      },
        React.createElement('div', {
          className: "grid grid-cols-8 border-b border-gray-300",
          style: {
            backgroundColor: backgroundColor === '#ffffff' ? '#f5f5f5' : backgroundColor
          }
        },
          React.createElement('div', { className: "p-4" }),
          getWeekDays(currentDate).map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return React.createElement('div', {
              key: index,
              className: "p-4 text-center"
            },
              React.createElement('div', {
                className: "text-xs font-bold uppercase tracking-widest",
                style: { color: textColor }
              }, day.toLocaleDateString('en-US', { weekday: 'short' })),
              React.createElement('div', {
                className: `text-2xl font-black mt-2 ${isToday ? 'w-10 h-10 rounded-full flex items-center justify-center mx-auto' : ''}`,
                style: {
                  color: isToday ? backgroundColor : textColor,
                  backgroundColor: isToday ? textColor : 'transparent'
                }
              }, day.getDate())
            );
          })
        ),
        React.createElement('div', { className: "flex-1" },
          getHoursArray().map(hour =>
            React.createElement('div', {
              key: hour,
              className: "grid grid-cols-8 border-b border-gray-300 min-h-[70px] hover:opacity-70 transition-opacity"
            },
              React.createElement('div', {
                className: "p-3 text-sm font-bold border-r border-gray-300",
                style: { color: textColor }
              }, formatTime(hour)),
              getWeekDays(currentDate).map((day, dayIndex) => {
                const dayEvents = getEventsForDate(day).filter(event =>
                  event.date.getHours() === hour
                );
                return React.createElement('div', {
                  key: dayIndex,
                  className: "border-r border-gray-300 p-2"
                },
                  dayEvents.map(event =>
                    React.createElement('div', {
                      key: event.id,
                      onClick: () => openEditModal(event),
                      className: "text-xs p-3 rounded-lg text-white font-bold mb-2 cursor-pointer hover:opacity-80 transition-opacity border border-gray-400",
                      style: { backgroundColor: event.color }
                    }, event.title)
                  )
                );
              })
            )
          )
        )
      ),

      viewMode === 'day' && React.createElement('div', {
        className: "flex flex-col",
        style: { backgroundColor }
      },
        React.createElement('div', {
          className: "p-6 border-b border-gray-300",
          style: {
            backgroundColor: backgroundColor === '#ffffff' ? '#f5f5f5' : backgroundColor
          }
        },
          React.createElement('div', { className: "text-center" },
            React.createElement('div', {
              className: "text-sm font-bold uppercase tracking-widest",
              style: { color: textColor }
            }, currentDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()),
            React.createElement('div', {
              className: "text-6xl font-black mt-2",
              style: { fontStretch: 'condensed', color: textColor }
            }, currentDate.getDate()),
            React.createElement('div', {
              className: "text-lg font-bold tracking-wide",
              style: {
                fontStretch: 'condensed',
                letterSpacing: '0.2em',
                color: textColor
              }
            }, (() => {
              const monthNames = {
                0: 'JAN', 1: 'FEB', 2: 'MAR', 3: 'APR', 4: 'MAY', 5: 'JUN',
                6: 'JUL', 7: 'AUG', 8: 'SEP', 9: 'OCT', 10: 'NOV', 11: 'DEC'
              };
              return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            })())
          )
        ),
        React.createElement('div', { className: "flex-1" },
          getHoursArray().map(hour => {
            const hourEvents = getEventsForDate(currentDate).filter(event =>
              event.date.getHours() === hour
            );
            return React.createElement('div', {
              key: hour,
              className: "flex border-b border-gray-300 min-h-[90px] hover:opacity-70 transition-opacity"
            },
              React.createElement('div', {
                className: "w-24 p-4 text-sm font-bold border-r border-gray-300",
                style: { color: textColor }
              }, formatTime(hour)),
              React.createElement('div', { className: "flex-1 p-3" },
                hourEvents.map(event =>
                  React.createElement('div', {
                    key: event.id,
                    onClick: () => openEditModal(event),
                    className: "p-4 rounded-xl text-white font-bold mb-3 cursor-pointer hover:opacity-80 transition-opacity border border-gray-400",
                    style: { backgroundColor: event.color }
                  },
                    React.createElement('div', {
                      className: "font-black text-lg"
                    }, event.title),
                    React.createElement('div', {
                      className: "text-sm opacity-90 font-bold"
                    }, event.date.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    }))
                  )
                )
              )
            );
          })
        )
      )
    ),

    // Settings Modal
    showSettings && React.createElement('div', {
      className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6"
    },
      React.createElement('div', {
        className: "bg-white w-full max-w-sm rounded-2xl p-6 space-y-6 border border-gray-300"
      },
        React.createElement('div', {
          className: "flex items-center justify-between"
        },
          React.createElement('h3', {
            className: "text-xl font-black text-black uppercase tracking-wider"
          }, "Settings"),
          React.createElement('button', {
            onClick: closeSettings,
            className: "text-gray-500 hover:text-black text-2xl font-bold"
          }, "×")
        ),
        React.createElement('div', { className: "space-y-4" },
          React.createElement('h4', {
            className: "text-lg font-bold text-black uppercase tracking-wide"
          }, "Theme"),
          React.createElement('div', {
            className: "flex items-center justify-between"
          },
            React.createElement('div', {
              className: "flex items-center space-x-4"
            },
              React.createElement('div', {
                className: "w-8 h-8 rounded-full border-2 border-gray-400",
                style: { backgroundColor: tempBackgroundColor }
              }),
              React.createElement('span', {
                className: "text-lg font-bold text-black uppercase tracking-wide"
              }, "Background")
            ),
            React.createElement('input', {
              type: "color",
              value: tempBackgroundColor,
              onChange: (e) => setTempBackgroundColor(e.target.value),
              className: "w-16 h-10 border-2 border-gray-400 rounded-lg cursor-pointer"
            })
          ),
          React.createElement('div', {
            className: "flex items-center justify-between"
          },
            React.createElement('div', {
              className: "flex items-center space-x-4"
            },
              React.createElement('div', {
                className: "w-8 h-8 rounded-full border-2 border-gray-400",
                style: { backgroundColor: tempTextColor }
              }),
              React.createElement('span', {
                className: "text-lg font-bold text-black uppercase tracking-wide"
              }, "Text")
            ),
            React.createElement('input', {
              type: "color",
              value: tempTextColor,
              onChange: (e) => setTempTextColor(e.target.value),
              className: "w-16 h-10 border-2 border-gray-400 rounded-lg cursor-pointer"
            })
          )
        ),
        React.createElement('div', { className: "space-y-4" },
          React.createElement('h4', {
            className: "text-lg font-bold text-black uppercase tracking-wide"
          }, "Categories"),
          Object.entries(tempCategories).map(([category, color]) =>
            React.createElement('div', {
              key: category,
              className: "flex items-center justify-between"
            },
              React.createElement('div', {
                className: "flex items-center space-x-4"
              },
                React.createElement('div', {
                  className: "w-8 h-8 rounded-full border-2 border-gray-400",
                  style: { backgroundColor: color }
                }),
                React.createElement('span', {
                  className: "text-lg font-bold text-black uppercase tracking-wide"
                }, category)
              ),
              React.createElement('input', {
                type: "color",
                value: color,
                onChange: (e) => updateTempColor(category, e.target.value),
                className: "w-16 h-10 border-2 border-gray-400 rounded-lg cursor-pointer"
              })
            )
          )
        ),
        React.createElement('div', {
          className: "flex space-x-3 pt-4 border-t border-gray-300"
        },
          React.createElement('button', {
            onClick: resetToDefaults,
            className: "flex-1 bg-gray-200 hover:bg-gray-300 text-black py-4 rounded-xl font-black uppercase tracking-wide transition-colors border border-gray-400"
          }, "Reset"),
          React.createElement('button', {
            onClick: saveSettings,
            className: "flex-1 bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-black uppercase tracking-wide transition-colors"
          }, "Save")
        )
      )
    ),

    // Edit Modal
    editingEvent && React.createElement('div', {
      className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6"
    },
      React.createElement('div', {
        className: "bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 border border-gray-300"
      },
        React.createElement('div', {
          className: "flex items-center justify-between"
        },
          React.createElement('h3', {
            className: "text-xl font-black text-black uppercase tracking-wider"
          }, "Edit Event"),
          React.createElement('button', {
            onClick: closeEditModal,
            className: "text-gray-500 hover:text-black text-2xl font-bold"
          }, "×")
        ),
        React.createElement('div', { className: "space-y-4" },
          React.createElement('div', null,
            React.createElement('label', {
              className: "block text-sm font-bold text-black mb-2 uppercase tracking-wide"
            }, "Title"),
            React.createElement('input', {
              type: "text",
              value: editTitle,
              onChange: (e) => setEditTitle(e.target.value),
              className: "w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white text-black font-bold"
            })
          ),
          React.createElement('div', null,
            React.createElement('label', {
              className: "block text-sm font-bold text-black mb-2 uppercase tracking-wide"
            }, "Date"),
            React.createElement('input', {
              type: "date",
              value: editDate,
              onChange: (e) => setEditDate(e.target.value),
              className: "w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white text-black font-bold"
            })
          ),
          React.createElement('div', null,
            React.createElement('label', {
              className: "block text-sm font-bold text-black mb-2 uppercase tracking-wide"
            }, "Time"),
            React.createElement('input', {
              type: "time",
              value: editTime,
              onChange: (e) => setEditTime(e.target.value),
              className: "w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white text-black font-bold"
            })
          ),
          React.createElement('div', null,
            React.createElement('label', {
              className: "block text-sm font-bold text-black mb-2 uppercase tracking-wide"
            }, "Category"),
            React.createElement('select', {
              value: editCategory,
              onChange: (e) => setEditCategory(e.target.value),
              className: "w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white text-black font-bold"
            },
              Object.keys(categories).map(category =>
                React.createElement('option', {
                  key: category,
                  value: category,
                  className: "bg-white text-black"
                }, category.charAt(0).toUpperCase() + category.slice(1))
              )
            )
          )
        ),
        React.createElement('div', {
          className: "flex space-x-3 pt-2"
        },
          React.createElement('button', {
            onClick: deleteEvent,
            className: "flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black uppercase tracking-wide transition-colors"
          }, "Delete"),
          React.createElement('button', {
            onClick: saveEditedEvent,
            className: "flex-1 bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-black uppercase tracking-wide transition-colors"
          }, "Save")
        )
      )
    ),

    // Add Button
    React.createElement('button', {
      onClick: () => setShowInput(true),
      className: "fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-105",
      style: { backgroundColor: textColor, color: backgroundColor }
    },
      React.createElement(Plus, { className: "w-8 h-8" })
    ),

    // Add Input Modal
    showInput && React.createElement('div', {
      className: "fixed inset-0 bg-black bg-opacity-50 flex items-end z-50"
    },
      React.createElement('div', {
        className: "bg-white w-full rounded-t-2xl p-6 space-y-4 border-t border-gray-300"
      },
        React.createElement('div', {
          className: "flex items-center justify-between"
        },
          React.createElement('h3', {
            className: "text-xl font-black text-black uppercase tracking-wider"
          }, "Add Event"),
          React.createElement('button', {
            onClick: () => setShowInput(false),
            className: "text-gray-500 hover:text-black text-2xl font-bold"
          }, "×")
        ),
        React.createElement('div', { className: "space-y-3" },
          React.createElement('p', {
            className: "text-sm text-gray-600 font-bold"
          }, 'Try: "Meeting at 5pm next monday with boss" or "Gym tomorrow at 7am"'),
          React.createElement('div', { className: "flex space-x-2" },
            React.createElement('input', {
              type: "text",
              value: inputText,
              onChange: (e) => setInputText(e.target.value),
              placeholder: "Describe your event...",
              className: "flex-1 px-4 py-4 border-2 border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white text-black font-bold placeholder-gray-500",
              onKeyPress: (e) => e.key === 'Enter' && addEvent()
            }),
            React.createElement('button', {
              className: "p-4 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors border border-gray-400"
            },
              React.createElement(Mic, { className: "w-6 h-6 text-gray-600" })
            )
          ),
          React.createElement('button', {
            onClick: addEvent,
            className: "w-full bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-black uppercase tracking-wide transition-colors"
          }, "Add Event")
        )
      )
    ),

    // Category Legend
    React.createElement('div', {
      className: "px-6 py-4 border-t border-gray-300",
      style: {
        backgroundColor: backgroundColor === '#ffffff' ? '#f5f5f5' : backgroundColor
      }
    },
      React.createElement('div', { className: "flex flex-wrap gap-4" },
        Object.entries(categories).map(([category, color]) =>
          React.createElement('div', {
            key: category,
            className: "flex items-center space-x-2"
          },
            React.createElement('div', {
              className: "w-4 h-4 rounded-full border border-gray-400",
              style: { backgroundColor: color }
            }),
            React.createElement('span', {
              className: "text-sm font-bold uppercase tracking-wide",
              style: { color: textColor }
            }, category)
          )
        )
      )
    )
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(AIMobileCalendar));