declare module '*.module.scss' {
  type CSSModuleClasses = Readonly<Record<string, string>>;
  const classes: CSSModuleClasses;
  export default classes;
}

declare module '*.svg' {
  const icon: string;
  export default icon;
}

declare module '*.png' {
  const url: string;
  export default url;
}

declare module '*.md' {
  const value: string;
  export default value;
}