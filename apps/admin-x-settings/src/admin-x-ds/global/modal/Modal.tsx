import Button, {ButtonColor, ButtonProps} from '../Button';
import ButtonGroup from '../ButtonGroup';
import Heading from '../Heading';
import React, {useEffect, useState} from 'react';
import StickyFooter from '../StickyFooter';
import clsx from 'clsx';
import useGlobalDirtyState from '../../../hooks/useGlobalDirtyState';
import {confirmIfDirty} from '../../../utils/modals';
import {useModal} from '@ebay/nice-modal-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'bleed' | number;

export interface ModalProps {

    /**
     * Possible values are: `sm`, `md`, `lg`, `xl, `full`, `bleed`. Yu can also use any number to set an arbitrary width.
     */
    size?: ModalSize;
    maxHeight?: number;

    testId?: string;
    title?: string;
    okLabel?: string;
    okColor?: ButtonColor;
    okLoading?: boolean;
    cancelLabel?: string;
    leftButtonProps?: ButtonProps;
    buttonsDisabled?: boolean;
    footer?: boolean | React.ReactNode;
    header?: boolean;
    padding?: boolean;
    onOk?: () => void;
    onCancel?: () => void;
    topRightContent?: 'close' | React.ReactNode;
    hideXOnMobile?: boolean;
    afterClose?: () => void;
    children?: React.ReactNode;
    backDrop?: boolean;
    backDropClick?: boolean;
    stickyFooter?: boolean;
    stickyHeader?:boolean;
    scrolling?: boolean;
    dirty?: boolean;
    animate?: boolean;
    formSheet?: boolean;
}

export const topLevelBackdropClasses = 'bg-[rgba(98,109,121,0.2)] backdrop-blur-[3px]';

const Modal: React.FC<ModalProps> = ({
    size = 'md',
    maxHeight,
    testId,
    title,
    okLabel = 'OK',
    okLoading = false,
    cancelLabel = 'Cancel',
    footer,
    header,
    leftButtonProps,
    buttonsDisabled,
    padding = true,
    onOk,
    okColor = 'black',
    onCancel,
    topRightContent,
    hideXOnMobile = false,
    afterClose,
    children,
    backDrop = true,
    backDropClick = true,
    stickyFooter = false,
    stickyHeader = false,
    scrolling = true,
    dirty = false,
    animate = true,
    formSheet = false
}) => {
    const modal = useModal();
    const {setGlobalDirtyState} = useGlobalDirtyState();
    const [animationFinished, setAnimationFinished] = useState(false);

    useEffect(() => {
        setGlobalDirtyState(dirty);
    }, [dirty, setGlobalDirtyState]);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (onCancel) {
                    onCancel();
                } else {
                    confirmIfDirty(dirty, () => {
                        modal.remove();
                        afterClose?.();
                    });
                }
            }
        };

        document.addEventListener('keydown', handleEscapeKey);

        // Clean up the event listener when the modal is closed
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [modal, dirty, afterClose, onCancel]);

    // The animation classes apply a transform to the modal, which breaks anything inside using position:fixed
    // We should remove the class as soon as the animation is finished
    useEffect(() => {
        const timeout = setTimeout(() => {
            setAnimationFinished(true);
        }, 250);

        return () => clearTimeout(timeout);
    }, []);

    let buttons: ButtonProps[] = [];

    let footerClasses, contentClasses;

    const removeModal = () => {
        confirmIfDirty(dirty, () => {
            modal.remove();
            afterClose?.();
        });
    };

    if (!footer) {
        if (cancelLabel) {
            buttons.push({
                key: 'cancel-modal',
                label: cancelLabel,
                color: 'outline',
                onClick: (onCancel ? onCancel : () => {
                    removeModal();
                }),
                disabled: buttonsDisabled
            });
        }

        if (okLabel) {
            buttons.push({
                key: 'ok-modal',
                label: okLabel,
                color: okColor,
                className: 'min-w-[80px]',
                onClick: onOk,
                disabled: buttonsDisabled,
                loading: okLoading
            });
        }
    }

    let modalClasses = clsx(
        'relative z-50 mx-auto flex max-h-[100%] w-full flex-col justify-between overflow-x-hidden bg-white dark:bg-black',
        size !== 'bleed' && 'rounded',
        formSheet ? 'shadow-md' : 'shadow-xl',
        (animate && !formSheet && !animationFinished) && 'animate-modal-in',
        (formSheet && !animationFinished) && 'animate-modal-in-reverse',
        scrolling ? 'overflow-y-auto' : 'overflow-y-hidden'
    );

    let backdropClasses = clsx(
        'fixed inset-0 z-40 h-[100vh] w-[100vw]'
    );

    let paddingClasses = '';
    let headerClasses = clsx(
        (!topRightContent || topRightContent === 'close') ? '' : 'flex items-center justify-between gap-5'
    );

    if (stickyHeader) {
        headerClasses = clsx(
            headerClasses,
            'sticky top-0 z-[200] -mb-4 bg-white !pb-4 dark:bg-black'
        );
    }

    switch (size) {
    case 'sm':
        modalClasses = clsx(
            modalClasses,
            'max-w-[480px]'
        );
        backdropClasses = clsx(
            backdropClasses,
            'p-4 md:p-[8vmin]'
        );
        paddingClasses = 'p-8';
        headerClasses = clsx(
            headerClasses,
            '-inset-x-8'
        );
        break;

    case 'md':
        modalClasses = clsx(
            modalClasses,
            'max-w-[720px]'
        );
        backdropClasses = clsx(
            backdropClasses,
            'p-4 md:p-[8vmin]'
        );
        paddingClasses = 'p-8';
        headerClasses = clsx(
            headerClasses,
            '-inset-x-8'
        );
        break;

    case 'lg':
        modalClasses = clsx(
            modalClasses,
            'max-w-[1020px]'
        );
        backdropClasses = clsx(
            backdropClasses,
            'p-4 md:p-[4vmin]'
        );
        paddingClasses = 'p-8';
        headerClasses = clsx(
            headerClasses,
            '-inset-x-8'
        );
        break;

    case 'xl':
        modalClasses = clsx(
            modalClasses,
            'max-w-[1240px]0'
        );
        backdropClasses = clsx(
            backdropClasses,
            'p-4 md:p-[3vmin]'
        );
        paddingClasses = 'p-10';
        headerClasses = clsx(
            headerClasses,
            '-inset-x-10 -top-10'
        );
        break;

    case 'full':
        modalClasses = clsx(
            modalClasses,
            'h-full'
        );
        backdropClasses = clsx(
            backdropClasses,
            'p-4 md:p-[3vmin]'
        );
        paddingClasses = 'p-10';
        headerClasses = clsx(
            headerClasses,
            '-inset-x-10'
        );
        break;

    case 'bleed':
        modalClasses = clsx(
            modalClasses,
            'h-full'
        );
        paddingClasses = 'p-10';
        headerClasses = clsx(
            headerClasses,
            '-inset-x-10'
        );
        break;

    default:
        backdropClasses = clsx(
            backdropClasses,
            'p-4 md:p-[8vmin]'
        );
        paddingClasses = 'p-8';
        headerClasses = clsx(
            headerClasses,
            '-inset-x-8'
        );
        break;
    }

    if (!padding) {
        paddingClasses = 'p-0';
    }

    modalClasses = clsx(
        modalClasses
    );

    headerClasses = clsx(
        headerClasses,
        paddingClasses,
        'pb-0'
    );

    contentClasses = clsx(
        paddingClasses,
        'py-0'
    );

    // Set bottom padding for backdrop when the menu is on
    backdropClasses = clsx(
        backdropClasses,
        'max-[800px]:!pb-20'
    );

    footerClasses = clsx(
        `${paddingClasses} ${stickyFooter ? 'py-6' : ''}`,
        'flex w-full items-center justify-between'
    );

    contentClasses = clsx(
        contentClasses,
        ((size === 'full' || size === 'bleed') && 'grow')
    );

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && backDropClick) {
            removeModal();
        }
    };

    let modalStyles:{maxWidth?: string; maxHeight?: string;} = {};

    if (typeof size === 'number') {
        modalStyles.maxWidth = size + 'px';
    }

    if (maxHeight) {
        modalStyles.maxHeight = maxHeight + 'px';
    }

    let footerContent;
    if (footer) {
        footerContent = footer;
    } else if (footer === false) {
        contentClasses += ' pb-0 ';
    } else {
        footerContent = (
            <div className={footerClasses}>
                <div>
                    {leftButtonProps && <Button {...leftButtonProps} />}
                </div>
                <div className='flex gap-3'>
                    <ButtonGroup buttons={buttons}/>
                </div>
            </div>
        );
    }

    footerContent = (stickyFooter ?
        <StickyFooter height={84}>
            {footerContent}
        </StickyFooter>
        :
        <>
            {footerContent}
        </>
    );

    return (
        <div className={backdropClasses} id='modal-backdrop' onMouseDown={handleBackdropClick}>
            <div className={clsx(
                'pointer-events-none fixed inset-0 z-0',
                (backDrop && !formSheet) && topLevelBackdropClasses,
                formSheet && 'bg-[rgba(98,109,121,0.08)]'
            )}></div>
            <section className={modalClasses} data-testid={testId} style={modalStyles}>
                {header === false ? '' : (!topRightContent || topRightContent === 'close' ?
                    (<header className={headerClasses}>
                        {title && <Heading level={3}>{title}</Heading>}
                        <div className={`${topRightContent !== 'close' && 'md:!invisible md:!hidden'} ${hideXOnMobile && 'hidden'} absolute right-6 top-6`}>
                            <Button className='-m-2 cursor-pointer p-2 opacity-50 hover:opacity-100' icon='close' iconColorClass='text-black dark:text-white' size='sm' unstyled onClick={removeModal} />
                        </div>
                    </header>)
                    :
                    (<header className={headerClasses}>
                        {title && <Heading level={3}>{title}</Heading>}
                        {topRightContent}
                    </header>))}
                <div className={contentClasses}>
                    {children}
                </div>
                {footerContent}
            </section>
        </div>
    );
};

export default Modal;
