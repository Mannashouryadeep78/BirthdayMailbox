export const ControlType = {
  Boolean: "boolean",
  Number: "number",
  String: "string",
  Color: "color",
} as const

export function addPropertyControls(component: any, controls: any) {
  // Store the controls metadata on the component so the dashboard can inspect it
  component.propertyControls = controls
}

export function useIsStaticRenderer() {
  return false
}
