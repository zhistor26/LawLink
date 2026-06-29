"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { useLazyCatNonModalDialogs } from "@/lib/lazycat/use-lazycat-non-modal-dialogs";

type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root>;

/**
 * 懒猫微服内默认 modal=false，避免 hideOthers + body pointer-events 阻断 inject 文件选择层。
 */
function Dialog({ modal, ...props }: DialogProps) {
  const lazyCatNonModal = useLazyCatNonModalDialogs();
  const effectiveModal = modal ?? !lazyCatNonModal;
  return <DialogPrimitive.Root modal={effectiveModal} {...props} />;
}

export { Dialog, DialogPrimitive };
