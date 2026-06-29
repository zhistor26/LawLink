"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode
} from "react";
import { createPortal } from "react-dom";

import { isLazyCatRuntime } from "@/lib/lazycat/env";
import { prepareLazyCatFilePickerOpen } from "@/lib/lazycat/prepare-file-picker";
import { cn } from "@/lib/utils";

/** inject 在网盘选文件后派发，React onChange 对非 trusted 事件可能不触发 */
export const LAZYCAT_FILE_INPUT_UPDATED = "lzc:file-input-updated";

export type LazyCatFileTriggerHandle = {
  open: () => void;
  reset: () => void;
};

type LazyCatFileTriggerProps = {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  onFiles: (files: File[]) => void;
  children?: ReactNode;
  showHint?: boolean;
};

/**
 * 隐藏 file input + children 点击触发 input.click()，供 inject hook。
 * 使用原生 change / 自定义事件监听，确保网盘选文件后 onFiles 必定触发。
 */
export const LazyCatFileTrigger = forwardRef<LazyCatFileTriggerHandle, LazyCatFileTriggerProps>(
  function LazyCatFileTrigger(
    {
      accept,
      multiple = false,
      disabled = false,
      className,
      onFiles,
      children,
      showHint = true
    },
    ref
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const onFilesRef = useRef(onFiles);
    const lazyCat = isLazyCatRuntime();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      onFilesRef.current = onFiles;
    }, [onFiles]);

    useEffect(() => {
      const el = inputRef.current;
      if (!el) return;

      const emit = () => {
        const list = el.files;
        if (!list || list.length === 0) return;
        onFilesRef.current(Array.from(list));
        el.value = "";
      };

      el.addEventListener("change", emit);
      el.addEventListener(LAZYCAT_FILE_INPUT_UPDATED, emit);
      return () => {
        el.removeEventListener("change", emit);
        el.removeEventListener(LAZYCAT_FILE_INPUT_UPDATED, emit);
      };
    }, [mounted, lazyCat]);

    const openPicker = () => {
      if (disabled) return;
      if (lazyCat) {
        prepareLazyCatFilePickerOpen();
      }
      inputRef.current?.click();
    };

    useImperativeHandle(ref, () => ({
      open: openPicker,
      reset: () => {
        if (inputRef.current) inputRef.current.value = "";
      }
    }));

    return (
      <div className={cn("inline-flex flex-col gap-1", className)}>
        {mounted && lazyCat
          ? createPortal(
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                className="hidden"
                tabIndex={-1}
                aria-hidden
                data-lzc-file-trigger="true"
              />,
              document.body
            )
          : (
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                className="hidden"
                tabIndex={-1}
                aria-hidden
              />
            )}
        {children ? (
          <span
            role="presentation"
            onClick={openPicker}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openPicker();
              }
            }}
            className={cn(disabled && "pointer-events-none opacity-50")}
          >
            {children}
          </span>
        ) : null}
        {showHint && lazyCat && children && (
          <span className="text-[11px] text-muted-foreground">
            点击后可从本地或懒猫网盘选择
          </span>
        )}
      </div>
    );
  }
);

LazyCatFileTrigger.displayName = "LazyCatFileTrigger";
