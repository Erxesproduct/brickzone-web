import type { DetailedHTMLProps, HTMLAttributes } from "react";

// <model-viewer> from @google/model-viewer, loaded on demand by components/ar-preview.tsx.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, unknown>;
    }
  }
}
