type Params = Object;

declare module 'abcjs' {
    const signature: string
    
    const renderAbc: (output: HTMLElement, abc: string, parameters: Params) => void
}
