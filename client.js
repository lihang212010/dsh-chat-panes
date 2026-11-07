/**
 * Multi-chat windows for the Harness Web GUI.
 *
 * The conversation header's top-right corner gains a split-view button. It opens
 * one global `multichat` main panel that renders up to sixteen live
 * conversations as freely resizable cards. Each card binds an explicit Session
 * through the renderer's `SessionProvider` seat and reuses the shipped
 * Conversation Component Factory (`conversation.content`, embedded variant), so
 * every card is the real chat surface: transcript, hero, composer, approvals and
 * streaming.
 *
 * Pane identity and per-pane pixel sizes live in localStorage, so a reload or a
 * trip to another panel restores the workspace.
 */
window.__ModuleLoader__.load({
  id: 'dsh-multichat',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'multichat';
    const PANEL_ID = 'multichat';
    const PANE_SLOT = 'multichat.pane';
    const RETENTION_SOURCE = 'multichat';
    const STORAGE_KEY = 'dsh.multichat.panes.v2';
    const LEGACY_STORAGE_KEY = 'dsh.multichat.panes.v1';
    const MAX_PANES = 16;
    const MIN_WIDTH = 300;
    const MIN_HEIGHT = 220;

    /* ------------------------------------------------------------------ */
    /* Dictionaries                                                        */
    /* ------------------------------------------------------------------ */

    const zh = {
      'openPanel': '多窗口聊天',
      'panel': '多窗口聊天',
      'title': '多窗口聊天',
      'subtitle': '在同一界面中并排使用多个对话，拖动窗口右下角可调整大小',
      'count': '{count} 个窗口',
      'add': '新建对话',
      'adding': '正在创建…',
      'back': '返回对话',
      'closePane': '关闭此窗口',
      'expandPane': '在完整对话中打开',
      'resizePane': '拖动调整窗口大小',
      'resetSizes': '恢复等分大小',
      'closeAll': '全部关闭',
      'emptyTitle': '还没有对话窗口',
      'emptyDescription': '点击“新建对话”打开一个窗口；每个窗口都可以拖动右下角自由调整大小。',
      'emptyAction': '新建对话窗口',
      'paneUntitled': '新对话',
      'paneDefaultWorkspace': '默认工作区',
      'paneLoading': '正在加载对话…',
      'maxReached': '最多同时打开 {max} 个窗口',
      'createFailed': '无法创建对话：{message}',
      'retainFailed': '无法打开这个对话：{message}',
      'openFailed': '无法切换到完整对话：{message}',
    };

    const en = {
      'openPanel': 'Multi-chat windows',
      'panel': 'Multi-chat windows',
      'title': 'Multi-chat windows',
      'subtitle': 'Run several conversations side by side; drag a window corner to resize it',
      'count': '{count} open',
      'add': 'New chat',
      'adding': 'Creating…',
      'back': 'Back to chat',
      'closePane': 'Close this window',
      'expandPane': 'Open in the full conversation',
      'resizePane': 'Drag to resize this window',
      'resetSizes': 'Reset pane sizes',
      'closeAll': 'Close all',
      'emptyTitle': 'No chat windows yet',
      'emptyDescription': 'Choose “New chat” to open a window. Drag any window corner to resize it freely.',
      'emptyAction': 'New chat window',
      'paneUntitled': 'New chat',
      'paneDefaultWorkspace': 'Default workspace',
      'paneLoading': 'Loading conversation…',
      'maxReached': 'At most {max} windows can be open',
      'createFailed': 'Could not create a chat: {message}',
      'retainFailed': 'Could not open this conversation: {message}',
      'openFailed': 'Could not switch to the full conversation: {message}',
    };

    /* ------------------------------------------------------------------ */
    /* Styles                                                              */
    /* ------------------------------------------------------------------ */

    const CSS = `
.mcx-root{box-sizing:border-box;display:flex;flex-direction:column;height:100%;min-width:0;min-height:0;overflow:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit}
.mcx-toolbar{flex:none;display:flex;align-items:center;gap:10px;height:56px;padding:0 16px;border-bottom:.5px solid var(--dsw-alias-border-l3);min-width:0}
.mcx-toolbar-icon{display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary);flex:none}
.mcx-toolbar-title{font-size:14px;font-weight:600;line-height:20px;white-space:nowrap;flex:none}
.mcx-count{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-bg-layer-2);border-radius:999px;padding:1px 8px;white-space:nowrap;flex:none}
.mcx-hint{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.mcx-toolbar-actions{margin-left:auto;display:flex;align-items:center;gap:8px;flex:none}
.mcx-primary{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border:none;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-inverted);font:inherit;font-size:13px;font-weight:500;line-height:18px;cursor:pointer;white-space:nowrap}
.mcx-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}
.mcx-primary:disabled{background:var(--dsw-alias-button-primary-dimmed);cursor:not-allowed}
.mcx-primary:focus-visible,.mcx-ghost:focus-visible,.mcx-icon-btn:focus-visible,.mcx-error-dismiss:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.mcx-ghost{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 9px;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;cursor:pointer;white-space:nowrap}
.mcx-ghost:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.mcx-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;flex:none}
.mcx-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.mcx-error{flex:none;display:flex;align-items:flex-start;gap:8px;margin:0 16px 8px;padding:8px 10px;border:.5px solid var(--dsw-alias-state-error-secondary);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-state-error-tertiary,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}
.mcx-error-text{flex:1;min-width:0;word-break:break-word}
.mcx-error-dismiss{border:none;background:transparent;color:inherit;font:inherit;cursor:pointer;padding:0 2px;line-height:18px}
.mcx-canvas{flex:1;min-height:0;min-width:0;overflow:auto;padding:12px;display:flex;flex-wrap:wrap;gap:12px;align-content:flex-start;align-items:flex-start}
.mcx-pane{position:relative;box-sizing:border-box;flex:0 0 auto;display:flex;flex-direction:column;min-width:min(300px,100%);max-width:100%;min-height:220px;overflow:hidden;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-base);box-shadow:var(--dsw-elevation-soft)}
.mcx-pane[data-active="true"]{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 1px var(--dsw-alias-state-business-primary),var(--dsw-elevation-soft)}
.mcx-pane-header{flex:none;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,auto) auto;align-items:center;gap:10px;height:42px;padding:0 8px 0 14px;border-bottom:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-1)}
.mcx-pane-title-wrap{display:flex;align-items:center;gap:7px;min-width:0}
.mcx-pane-title{font-size:13px;font-weight:500;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.mcx-pane-workspace{display:inline-flex;align-items:center;gap:4px;min-width:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;justify-self:center}
.mcx-pane-workspace svg{flex:none}
.mcx-pane-actions{display:flex;align-items:center;gap:2px;flex:none}
.mcx-pane-body{flex:1;min-height:0;display:flex;overflow:hidden}
.mcx-pane-body>*{flex:1;min-width:0;min-height:0}
.mcx-pane-resize{position:absolute;right:0;bottom:0;z-index:3;display:flex;align-items:flex-end;justify-content:flex-end;width:18px;height:18px;padding:3px;cursor:nwse-resize;opacity:0;transition:opacity .15s ease}
.mcx-pane:hover .mcx-pane-resize,.mcx-pane-resize:focus-visible{opacity:1}
.mcx-pane-resize:after{content:"";width:8px;height:8px;border-right:1.5px solid var(--dsw-alias-label-tertiary);border-bottom:1.5px solid var(--dsw-alias-label-tertiary);border-bottom-right-radius:2px}
.mcx-pane-loading{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;color:var(--dsw-alias-label-tertiary);font-size:13px}
.mcx-empty{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:24px;text-align:center}
.mcx-empty-art{display:flex;align-items:center;justify-content:center;width:72px;height:72px;margin-bottom:6px;border-radius:20px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary)}
.mcx-empty-title{font-size:16px;font-weight:600;line-height:24px;color:var(--dsw-alias-label-primary)}
.mcx-empty-desc{max-width:440px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-tertiary)}
.mcx-empty-action{margin-top:12px;height:34px;padding:0 16px}
.mcx-spinner{width:14px;height:14px;flex:none;border-radius:50%;border:2px solid var(--dsw-alias-label-dimmed);border-top-color:var(--dsw-alias-brand-primary);animation:mcx-spin .8s linear infinite}
@keyframes mcx-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.mcx-spinner{animation-duration:2.4s}}
@media (max-width:900px){.mcx-hint{display:none}.mcx-canvas{padding:8px;gap:8px}}
@media (max-width:560px){.mcx-toolbar{padding:0 10px;gap:8px}.mcx-toolbar-title{font-size:13px}.mcx-canvas{padding:6px;gap:6px}}
`;

    const HEADER_CSS = `
.mcx-open-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;flex:none}
.mcx-open-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.mcx-open-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
`;

    /* ------------------------------------------------------------------ */
    /* Icons                                                               */
    /* ------------------------------------------------------------------ */

    function Svg(props) {
      return h('svg', {
        width: props.size === undefined ? 16 : props.size,
        height: props.size === undefined ? 16 : props.size,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': 'true',
        focusable: 'false',
        children: props.children,
      });
    }

    function PlusIcon(props) {
      return h(Svg, { size: props.size }, h('path', {
        d: 'M12 5v14M5 12h14',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
      }));
    }

    function CloseIcon(props) {
      return h(Svg, { size: props.size }, h('path', {
        d: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
      }));
    }

    function ExpandIcon(props) {
      return h(Svg, { size: props.size }, h('path', {
        d: 'M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }));
    }

    function BackIcon(props) {
      return h(Svg, { size: props.size }, h('path', {
        d: 'M19 12H5M11 6l-6 6 6 6',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }));
    }

    function FolderIcon(props) {
      return h(Svg, { size: props.size }, h('path', {
        d: 'M3.5 7.5a2 2 0 0 1 2-2h3.2l1.6 1.8h8.2a2 2 0 0 1 2 2v8.2a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2V7.5Z',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinejoin: 'round',
      }));
    }

    function SplitIcon(props) {
      return h(Svg, { size: props.size }, [
        h('rect', {
          key: 'frame',
          x: 2.75,
          y: 4.75,
          width: 18.5,
          height: 14.5,
          rx: 3.25,
          stroke: 'currentColor',
          strokeWidth: 1.5,
        }),
        h('path', {
          key: 'divider',
          d: 'M12 5.4v13.2',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
        }),
        h('path', {
          key: 'dots',
          d: 'M6.6 9.2h2.2M6.6 12h2.2M6.6 14.8h2.2',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          opacity: 0.65,
        }),
      ]);
    }

    function ResetIcon(props) {
      return h(Svg, { size: props.size }, [
        h('path', {
          key: 'a',
          d: 'M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
        h('rect', {
          key: 'b',
          x: 8,
          y: 9,
          width: 8,
          height: 6,
          rx: 1.2,
          stroke: 'currentColor',
          strokeWidth: 1.4,
        }),
      ]);
    }

    /* ------------------------------------------------------------------ */
    /* Persistence                                                         */
    /* ------------------------------------------------------------------ */

    function normalizePane(entry) {
      if (typeof entry === 'string') return entry === '' ? null : { id: entry };
      if (entry === null || typeof entry !== 'object' || typeof entry.id !== 'string' || entry.id === '') return null;
      const pane = { id: entry.id };
      if (typeof entry.w === 'number' && Number.isFinite(entry.w) && entry.w >= MIN_WIDTH) pane.w = Math.round(entry.w);
      if (typeof entry.h === 'number' && Number.isFinite(entry.h) && entry.h >= MIN_HEIGHT) pane.h = Math.round(entry.h);
      return pane;
    }

    function parsePaneList(raw) {
      if (raw === null) return undefined;
      try {
        const parsed = JSON.parse(raw);
        if (parsed === null || typeof parsed !== 'object' || !Array.isArray(parsed.panes)) return [];
        return parsed.panes.map(normalizePane).filter((pane) => pane !== null);
      } catch (_error) {
        return [];
      }
    }

    function readPanes() {
      try {
        const current = parsePaneList(window.localStorage.getItem(STORAGE_KEY));
        if (current !== undefined) return current;
        return parsePaneList(window.localStorage.getItem(LEGACY_STORAGE_KEY)) ?? [];
      } catch (_error) {
        return [];
      }
    }

    function writePanes(panes) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ panes }));
      } catch (_error) {
        /* A full or disabled localStorage only loses the restore convenience. */
      }
    }

    /** One page-wide pane store shared by the panel and the header button. */
    function createPaneStore() {
      let panes = readPanes();
      const listeners = new Set();
      const publish = () => {
        for (const listener of [...listeners]) listener();
      };
      const commit = (next) => {
        panes = next;
        writePanes(panes);
        publish();
      };
      return {
        subscribe(listener) {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
        getSnapshot() {
          return panes;
        },
        add(sessionId) {
          if (typeof sessionId !== 'string' || sessionId === '') return;
          if (panes.some((pane) => pane.id === sessionId)) return;
          if (panes.length >= MAX_PANES) return;
          commit([...panes, { id: sessionId }]);
        },
        remove(sessionId) {
          if (!panes.some((pane) => pane.id === sessionId)) return;
          commit(panes.filter((pane) => pane.id !== sessionId));
        },
        closeAll() {
          if (panes.length > 0) commit([]);
        },
        resize(sessionId, width, height) {
          commit(panes.map((pane) => pane.id === sessionId
            ? {
              ...pane,
              w: Math.max(MIN_WIDTH, Math.round(width)),
              h: Math.max(MIN_HEIGHT, Math.round(height)),
            }
            : pane));
        },
        resetSizes() {
          if (!panes.some((pane) => pane.w !== undefined || pane.h !== undefined)) return;
          commit(panes.map((pane) => ({ id: pane.id })));
        },
        resetSize(sessionId) {
          const target = panes.find((pane) => pane.id === sessionId);
          if (target === undefined || (target.w === undefined && target.h === undefined)) return;
          commit(panes.map((pane) => pane.id === sessionId ? { id: pane.id } : pane));
        },
      };
    }

    /* ------------------------------------------------------------------ */
    /* Small view helpers                                                  */
    /* ------------------------------------------------------------------ */

    function messageOf(error) {
      if (error !== null && typeof error === 'object' && typeof error.message === 'string' && error.message !== '') return error.message;
      return String(error);
    }

    function Spinner() {
      return h('span', { className: 'mcx-spinner', 'aria-hidden': 'true' });
    }

    function PaneLoading({ t }) {
      return h('div', { className: 'mcx-pane-loading' }, h(Spinner, null), h('span', null, t('paneLoading')));
    }

    /** The fixed Chat view of one embedded Conversation occurrence. */
    function PaneChatView(props) {
      return props.renderSlot('conversation.session', { view: 'chat' });
    }

    /**
     * Session-scoped pane body: decide hero/active/settling exactly like the
     * shipped Conversation panel, then render the shared embedded content.
     */
    function PaneContent(props) {
      const {
        sessionId, useSession, useConversation, useSessions, renderFactorySlot, t,
      } = props;
      const session = useSession((value) => value);
      const conversation = useConversation((value) => value);
      const summaryBlank = useSessions((state) => state.byId[sessionId] === undefined ? undefined : state.byId[sessionId].blank);
      if (session === undefined || conversation === undefined) return h(PaneLoading, { t });
      const shellPhase = conversation.activeTargets.size > 0
        || (!session.blank && !session.awaitingFirstTurn)
        || session.running
        ? 'active'
        : session.promptAttempted ? 'engaging' : 'blank';
      const parentAvailabilityPending = session.subagent !== null
        && session.subagent !== undefined
        && session.subagent.address !== undefined
        && session.subagent.address.mode === 'continuable'
        && session.subagent.parentAvailable === undefined;
      const settling = (shellPhase === 'blank' && session.openState === 'loading' && summaryBlank !== true)
        || parentAvailabilityPending;
      const hero = shellPhase === 'blank' && (session.openState === 'open' || summaryBlank === true);
      const phase = settling ? 'settling' : hero ? 'hero' : 'active';
      return renderFactorySlot('conversation.content', {
        variant: 'embedded',
        phase,
        hero,
      }, { slots: { views: PaneChatView } });
    }

    /**
     * One freely resizable pane: slim header plus the live Conversation content
     * bound to an explicit retained Session reference.
     */
    function Pane(props) {
      const {
        sessionId, pane, reference, active, t, SessionProvider, renderSlot,
        useSessions, useWorkspaces, openSession, closePane, activate, onResize,
      } = props;
      const title = useSessions((state) => state.byId[sessionId] === undefined ? undefined : state.byId[sessionId].title);
      const workspaceTitle = useWorkspaces((state) => {
        const row = state.items.find((item) => Array.isArray(item.sessionIds) && item.sessionIds.includes(sessionId));
        return row === undefined ? undefined : row.title;
      });
      const label = typeof title === 'string' && title.trim() !== '' ? title : t('paneUntitled');
      const workspaceLabel = workspaceTitle === undefined || workspaceTitle === ''
        ? undefined
        : workspaceTitle === 'default-workspace' ? t('paneDefaultWorkspace') : workspaceTitle;

      const sectionRef = React.useRef(null);
      const dragRef = React.useRef(null);

      const endDrag = (element) => {
        const drag = dragRef.current;
        if (drag === null) return;
        dragRef.current = null;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        if (element !== undefined) {
          try {
            element.releasePointerCapture(drag.pointerId);
          } catch (_error) {
            /* The pointer may already be gone. */
          }
        }
        if (drag.next !== undefined) onResize(drag.next.width, drag.next.height);
      };

      const onHandlePointerDown = (event) => {
        if (event.button !== 0) return;
        const section = sectionRef.current;
        if (section === null) return;
        event.preventDefault();
        event.stopPropagation();
        const rect = section.getBoundingClientRect();
        dragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          width: rect.width,
          height: rect.height,
          next: undefined,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'nwse-resize';
      };

      const onHandlePointerMove = (event) => {
        const drag = dragRef.current;
        if (drag === null || drag.pointerId !== event.pointerId) return;
        const section = sectionRef.current;
        if (section === null) return;
        const host = section.parentElement;
        const maxWidth = host === null ? window.innerWidth : Math.max(MIN_WIDTH, host.clientWidth - 16);
        const width = Math.min(maxWidth, Math.max(MIN_WIDTH, drag.width + event.clientX - drag.startX));
        const height = Math.max(MIN_HEIGHT, drag.height + event.clientY - drag.startY);
        section.style.width = `${Math.round(width)}px`;
        section.style.height = `${Math.round(height)}px`;
        drag.next = { width, height };
      };

      const onHandlePointerUp = (event) => {
        endDrag(event.currentTarget);
      };

      const onHandlePointerCancel = (event) => {
        endDrag(event.currentTarget);
      };

      const style = {
        width: pane.w === undefined ? 'max(320px, calc(50% - 6px))' : `${pane.w}px`,
        height: pane.h === undefined ? '420px' : `${pane.h}px`,
      };

      return h('section', {
        ref: sectionRef,
        className: 'mcx-pane',
        style,
        'data-active': active ? 'true' : undefined,
        'data-session-id': sessionId,
        onPointerDownCapture: activate,
      }, [
        h('header', { key: 'header', className: 'mcx-pane-header' }, [
          h('div', { key: 'title', className: 'mcx-pane-title-wrap' },
            h('span', { key: 'label', className: 'mcx-pane-title', title: label }, label)),
          h('span', { key: 'workspace', className: 'mcx-pane-workspace', title: workspaceLabel }, [
            workspaceLabel === undefined ? null : h(FolderIcon, { key: 'icon', size: 12 }),
            workspaceLabel === undefined ? null : h('span', { key: 'name' }, workspaceLabel),
          ]),
          h('div', { key: 'actions', className: 'mcx-pane-actions' }, [
            h('button', {
              key: 'expand',
              type: 'button',
              className: 'mcx-icon-btn',
              title: t('expandPane'),
              'aria-label': t('expandPane'),
              onClick: (event) => {
                event.stopPropagation();
                openSession(sessionId);
              },
            }, h(ExpandIcon, { size: 14 })),
            h('button', {
              key: 'close',
              type: 'button',
              className: 'mcx-icon-btn',
              title: t('closePane'),
              'aria-label': t('closePane'),
              onClick: (event) => {
                event.stopPropagation();
                closePane(sessionId);
              },
            }, h(CloseIcon, { size: 14 })),
          ]),
        ]),
        h('div', { key: 'body', className: 'mcx-pane-body' },
          reference === undefined
            ? h(PaneLoading, { t })
            : h(SessionProvider, { session: reference }, renderSlot(PANE_SLOT, { sessionId }))),
        h('div', {
          key: 'resize',
          className: 'mcx-pane-resize',
          title: t('resizePane'),
          'aria-label': t('resizePane'),
          'aria-hidden': 'true',
          onPointerDown: onHandlePointerDown,
          onPointerMove: onHandlePointerMove,
          onPointerUp: onHandlePointerUp,
          onPointerCancel: onHandlePointerCancel,
          onDoubleClick: (event) => {
            event.stopPropagation();
            onResize(undefined, undefined);
          },
        }),
      ]);
    }

    /* ------------------------------------------------------------------ */
    /* Panel                                                               */
    /* ------------------------------------------------------------------ */

    function MultiChat(props) {
      const {
        t, paneStore, SessionProvider, renderSlot, useSessions, useWorkspaces, useRemoteAccess,
        createSession, retainSession, currentMainSessionId, openSession, closePanel,
      } = props;
      const panes = React.useSyncExternalStore(paneStore.subscribe, paneStore.getSnapshot, paneStore.getSnapshot);
      const [activeId, setActiveId] = React.useState(null);
      const [creating, setCreating] = React.useState(false);
      const [errorText, setErrorText] = React.useState(null);
      const refsRef = React.useRef(new Map());
      const [, setRefsVersion] = React.useState(0);
      const seededRef = React.useRef(false);
      const canCreate = useRemoteAccess('session/create');
      const atMax = panes.length >= MAX_PANES;
      const createAllowed = canCreate !== false;
      const paneIds = panes.map((pane) => pane.id);
      const idsKey = paneIds.join('|');

      /* Seed the first pane with the conversation the user came from. */
      React.useEffect(() => {
        if (seededRef.current) return;
        seededRef.current = true;
        if (paneStore.getSnapshot().length > 0) return;
        const mainId = currentMainSessionId();
        if (typeof mainId === 'string' && mainId !== '') paneStore.add(mainId);
      }, []);

      /* Retain live references for exactly the listed panes; drop dead ids. */
      React.useEffect(() => {
        const refs = refsRef.current;
        const live = new Set(paneIds);
        let changed = false;
        for (const [id, entry] of [...refs]) {
          if (live.has(id)) continue;
          refs.delete(id);
          changed = true;
          try {
            entry.release();
          } catch (error) {
            console.warn('multichat: releasing session failed', id, error);
          }
        }
        for (const id of paneIds) {
          if (refs.has(id)) continue;
          try {
            refs.set(id, retainSession(id));
            changed = true;
          } catch (error) {
            console.warn('multichat: retaining session failed', id, error);
            setErrorText(t('retainFailed', { message: messageOf(error) }));
          }
        }
        const kept = paneIds.filter((id) => refs.has(id));
        if (kept.length !== paneIds.length) {
          const keptSet = new Set(kept);
          for (const pane of paneStore.getSnapshot()) {
            if (!keptSet.has(pane.id)) paneStore.remove(pane.id);
          }
          return;
        }
        if (changed) setRefsVersion((version) => version + 1);
      }, [idsKey]);

      /* Release every pane reference when the panel leaves the screen. */
      React.useEffect(() => () => {
        for (const entry of refsRef.current.values()) {
          try {
            entry.release();
          } catch (error) {
            console.warn('multichat: releasing session failed on dispose', error);
          }
        }
        refsRef.current.clear();
      }, []);

      /* Keep the active ring on an existing pane. */
      React.useEffect(() => {
        if (paneIds.length === 0) {
          if (activeId !== null) setActiveId(null);
          return;
        }
        if (activeId === null || !paneIds.includes(activeId)) setActiveId(paneIds[0]);
      }, [idsKey, activeId]);

      const addPane = React.useCallback(async () => {
        if (creating || paneStore.getSnapshot().length >= MAX_PANES || !createAllowed) return;
        setCreating(true);
        setErrorText(null);
        try {
          const sessionId = await createSession();
          if (typeof sessionId !== 'string' || sessionId === '') throw new Error('The Host returned no Session id');
          paneStore.add(sessionId);
          setActiveId(sessionId);
        } catch (error) {
          setErrorText(t('createFailed', { message: messageOf(error) }));
        } finally {
          setCreating(false);
        }
      }, [creating, createAllowed, createSession, paneStore, t]);

      const closePane = React.useCallback((sessionId) => {
        paneStore.remove(sessionId);
      }, [paneStore]);

      const closeAll = React.useCallback(() => {
        paneStore.closeAll();
      }, [paneStore]);

      const resetSizes = React.useCallback(() => {
        paneStore.resetSizes();
      }, [paneStore]);

      const resizePane = React.useCallback((sessionId, width, height) => {
        if (width === undefined || height === undefined) {
          paneStore.resetSize(sessionId);
          return;
        }
        paneStore.resize(sessionId, width, height);
      }, [paneStore]);

      const expandPane = React.useCallback((sessionId) => {
        try {
          openSession(sessionId);
        } catch (error) {
          setErrorText(t('openFailed', { message: messageOf(error) }));
        }
      }, [openSession, t]);

      const addButton = h('button', {
        key: 'add',
        type: 'button',
        className: 'mcx-primary',
        onClick: addPane,
        disabled: creating || atMax || !createAllowed,
        title: atMax ? t('maxReached', { max: MAX_PANES }) : t('add'),
        'aria-label': atMax ? t('maxReached', { max: MAX_PANES }) : t('add'),
      }, [
        creating ? h(Spinner, { key: 'spinner' }) : h(PlusIcon, { key: 'plus', size: 15 }),
        h('span', { key: 'label' }, creating ? t('adding') : t('add')),
      ]);

      return h('div', { className: 'mcx-root' }, [
        h('style', { key: 'style' }, CSS),
        h('div', { key: 'toolbar', className: 'mcx-toolbar' }, [
          h('span', { key: 'icon', className: 'mcx-toolbar-icon' }, h(SplitIcon, { size: 17 })),
          h('span', { key: 'title', className: 'mcx-toolbar-title' }, t('title')),
          panes.length > 0
            ? h('span', { key: 'count', className: 'mcx-count' }, t('count', { count: panes.length }))
            : null,
          h('span', { key: 'hint', className: 'mcx-hint' }, t('subtitle')),
          h('div', { key: 'actions', className: 'mcx-toolbar-actions' }, [
            panes.length > 1
              ? h('button', {
                key: 'reset',
                type: 'button',
                className: 'mcx-icon-btn',
                title: t('resetSizes'),
                'aria-label': t('resetSizes'),
                onClick: resetSizes,
              }, h(ResetIcon, { size: 15 }))
              : null,
            panes.length > 1
              ? h('button', {
                key: 'close-all',
                type: 'button',
                className: 'mcx-ghost',
                onClick: closeAll,
              }, t('closeAll'))
              : null,
            h('button', {
              key: 'back',
              type: 'button',
              className: 'mcx-icon-btn',
              title: t('back'),
              'aria-label': t('back'),
              onClick: closePanel,
            }, h(BackIcon, { size: 16 })),
            addButton,
          ]),
        ]),
        errorText === null ? null : h('div', { key: 'error', className: 'mcx-error', role: 'alert' }, [
          h('span', { key: 'text', className: 'mcx-error-text' }, errorText),
          h('button', {
            key: 'dismiss',
            type: 'button',
            className: 'mcx-error-dismiss',
            onClick: () => setErrorText(null),
            'aria-label': t('back'),
          }, '\u00d7'),
        ]),
        paneIds.length === 0
          ? h('div', { key: 'empty', className: 'mcx-empty' }, [
            h('div', { key: 'art', className: 'mcx-empty-art' }, h(SplitIcon, { size: 34 })),
            h('div', { key: 'empty-title', className: 'mcx-empty-title' }, t('emptyTitle')),
            h('div', { key: 'empty-desc', className: 'mcx-empty-desc' }, t('emptyDescription')),
            h('button', {
              key: 'empty-action',
              type: 'button',
              className: 'mcx-primary mcx-empty-action',
              onClick: addPane,
              disabled: creating || !createAllowed,
            }, [
              creating ? h(Spinner, { key: 'spinner' }) : h(PlusIcon, { key: 'plus', size: 15 }),
              h('span', { key: 'label' }, creating ? t('adding') : t('emptyAction')),
            ]),
          ])
          : h('div', { key: 'canvas', className: 'mcx-canvas', 'data-count': paneIds.length },
            panes.map((pane) => h(Pane, {
              key: pane.id,
              sessionId: pane.id,
              pane,
              reference: refsRef.current.get(pane.id),
              active: activeId === pane.id,
              t,
              SessionProvider,
              renderSlot,
              useSessions,
              useWorkspaces,
              openSession: expandPane,
              closePane,
              activate: () => setActiveId(pane.id),
              onResize: (width, height) => resizePane(pane.id, width, height),
            }))),
      ]);
    }

    /** Top-right header control that opens the panel with the current Session. */
    function HeaderButton(props) {
      const { t, openWithSession } = props;
      return h(React.Fragment, null,
        h('style', { key: 'style' }, HEADER_CSS),
        h('button', {
          key: 'button',
          type: 'button',
          className: 'mcx-open-btn',
          title: t('openPanel'),
          'aria-label': t('openPanel'),
          onClick: openWithSession,
        }, h(SplitIcon, { size: 17 })));
    }

    /* ------------------------------------------------------------------ */
    /* Plugin                                                              */
    /* ------------------------------------------------------------------ */

    /** Newest Workspace that already hosts a Session, preferring the main one. */
    function resolveWorkspaceId(ctx) {
      const service = ctx.uiWorkspace;
      if (service === undefined || service === null) return undefined;
      const workspaceSnapshot = service.workspaces.list.getSnapshot();
      const items = Array.isArray(workspaceSnapshot.items) ? workspaceSnapshot.items : [];
      const mainSessionId = service.mainReference === undefined ? undefined : service.mainReference.sessionId;
      if (typeof mainSessionId === 'string') {
        const owner = items.find((item) => Array.isArray(item.sessionIds) && item.sessionIds.includes(mainSessionId));
        if (owner !== undefined) return owner.workspaceId;
      }
      const sessionSnapshot = ctx.sessions.list.getSnapshot();
      let best;
      let bestTime = Number.NEGATIVE_INFINITY;
      for (const workspace of items) {
        let latest = Number.NEGATIVE_INFINITY;
        for (const sessionId of Array.isArray(workspace.sessionIds) ? workspace.sessionIds : []) {
          const row = sessionSnapshot.byId === undefined ? undefined : sessionSnapshot.byId[sessionId];
          const updatedAt = row === undefined ? undefined : row.updatedAt;
          if (typeof updatedAt === 'number' && updatedAt > latest) latest = updatedAt;
        }
        if (latest === Number.NEGATIVE_INFINITY) {
          const createdAt = Date.parse(workspace.createdAt);
          latest = Number.isFinite(createdAt) ? createdAt : 0;
        }
        if (best === undefined || latest > bestTime) {
          best = workspace;
          bestTime = latest;
        }
      }
      return best === undefined ? undefined : best.workspaceId;
    }

    function apply(ctx) {
      const store = createPaneStore();
      const t = ctx.locale.bind(NS);
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'multichat: dictionaries');

      const createSession = async () => {
        const workspaceId = resolveWorkspaceId(ctx);
        return ctx.sessions.create(workspaceId === undefined ? {} : { workspaceId });
      };

      const helpers = {
        paneStore: store,
        createSession,
        retainSession: (sessionId) => ctx.sessions.retain(sessionId, { source: RETENTION_SOURCE }),
        currentMainSessionId: () => {
          const service = ctx.uiWorkspace;
          if (service === undefined || service === null) return undefined;
          const reference = service.mainReference;
          return reference === undefined ? undefined : reference.sessionId;
        },
        openSession: (sessionId) => {
          const service = ctx.uiWorkspace;
          if (service === undefined || service === null) throw new Error('Workspace navigation is unavailable');
          service.openSession(sessionId);
        },
        closePanel: () => ctx.layout.selectPanel(null),
      };

      ctx.effect(() => ctx.slots.inject('main', function* multichatMain() {
        yield ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
          inject: () => helpers,
          children: {
            [PANE_SLOT]: {
              kind: 'single',
              scope: 'session',
            },
          },
        }, MultiChat);
        yield ctx.slots.register({
          name: PANE_SLOT,
          locale: NS,
        }, PaneContent);
      }), 'multichat: main panel');

      ctx.effect(() => ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
        name: 'conversation.session.header.utilities',
        id: 'multichat-open',
        order: 0,
        locale: NS,
        inject: (sessionId) => ({
          openWithSession: () => {
            store.add(sessionId);
            ctx.layout.selectPanel(PANEL_ID);
          },
        }),
      }, HeaderButton)), 'multichat: header entry');
    }

    return {
      inject: ['slots', 'layout', 'sessions', 'uiWorkspace', 'locale'],
      apply,
    };
  },
});
