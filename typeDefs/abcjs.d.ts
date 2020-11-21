type Params = {
    add_classes: boolean,
    responsive: 'resize' | undefined
}

declare module 'abcjs' {
    const signature: string
    
    const renderAbc: (output: HTMLElement, abc: string, parameters: Params) => void
}
