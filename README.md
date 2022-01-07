# Obsidian ABC.JS plugin

This plugin renders music sheets from code blocks using the `music-abc` language. Under the hood it uses [abc.js](https://paulrosen.github.io/abcjs/) and supports everything the library does.

## Examples

### Simple song

![Example music sheet](example.png)

    ```music-abc
    X:1
    T:The Legacy Jig
    M:6/8
    L:1/8
    R:jig
    K:G
    GFG BAB | gfg gab | GFG BAB | d2A AFD |
    GFG BAB | gfg gab | age edB |1 dBA AFD :|2 dBA ABd |:
    efe edB | dBA ABd | efe edB | gdB ABd |
    efe edB | d2d def | gfe edB |1 dBA ABd :|2 dBA AFD |]
    ```

### Chorus music

    ```music-abc
    X: 1
    T: Chorus
    V: T1 clef=treble name="Soprano"
    V: T2 clef=treble name="Alto"
    V: B1 clef=bass name="Tenor"
    V: B2 clef=bass name="Bass"
    L:1/8
    K:G
    P:First Part
    [V: T1]"C"ed"Am"ed "F"cd"G7"gf |
    [V: T2]GGAA- A2BB |
    [V: B1]C3D- DF,3 |
    [V: B2]C,2A,,2 F,,2G,,2 |
    ```

## Maintenance & Contributions

At the moment, I am not actively using Obsidian and thus do not invest much time into this plugin. However, it does work regardless and if have feedback do feel free to open an issue. Be aware though that I might not have the time available to invest into solving your particular request on short notice. If you know your way around code, please consider contributing a pull request! I will gladly review and merge it.
