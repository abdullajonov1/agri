import { React } from "jimu-core";

const NOTICE_DURATION_MS = 1800;

export interface AccessNotice {
    notice: string | null;
    showNotice: (message: string) => void;
}

/** Transient toast message that auto-hides after a short delay. */
export function useAccessNotice(): AccessNotice {
    const [notice, setNotice] = React.useState<string | null>(null);
    const noticeTimer = React.useRef<number | null>(null);

    const showNotice = (message: string): void => {
        if (noticeTimer.current !== null) {
            window.clearTimeout(noticeTimer.current);
        }

        setNotice(message);
        noticeTimer.current = window.setTimeout(() => {
            setNotice(null);
            noticeTimer.current = null;
        }, NOTICE_DURATION_MS);
    };

    React.useEffect(() => {
        return () => {
            if (noticeTimer.current !== null) {
                window.clearTimeout(noticeTimer.current);
            }
        };
    }, []);

    return { notice, showNotice };
}
