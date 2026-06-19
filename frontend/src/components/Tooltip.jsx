import React, { useState } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  safePolygon,
  FloatingPortal,
  useTransitionStyles
} from '@floating-ui/react';

export default function Tooltip({ content, children, placement = 'top' }) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({
        fallbackAxisSideDirection: 'start',
      }),
      shift(),
    ],
  });

  const hover = useHover(context, {
    delay: { open: 300, close: 100 },
    handleClose: safePolygon(),
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: { open: 150, close: 100 },
    initial: { opacity: 0, transform: 'scale(0.95)' },
    open: { opacity: 1, transform: 'scale(1)' },
  });

  if (!content) return <>{children}</>;

  let trigger;
  if (React.isValidElement(children)) {
    trigger = React.cloneElement(children, getReferenceProps({
      ref: refs.setReference,
      ...children.props,
    }));
  } else {
    trigger = <span ref={refs.setReference} {...getReferenceProps()}>{children}</span>;
  }

  return (
    <>
      {trigger}
      {isMounted && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              ...transitionStyles,
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(0, 212, 255, 0.25)',
              borderRadius: '6px',
              color: '#e8e6e0',
              padding: '6px 10px',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
              lineHeight: '1.4',
              maxWidth: '200px',
              zIndex: 9999,
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
            {...getFloatingProps()}
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
