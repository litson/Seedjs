// defaultConfig 为 Seedjs 为您分析好的返回值，可供参考，或再无需分析的时候可直接返回他
Seed.data.map = function ( url, defaultConfig ) {
    // 根据 url 分析出如下数据结构

    return {
        id     : '将会被存储的id',
        hook   : '是否应该更新的标记',
        fileUrl: '原始路径'
    }

    // 如果拿不定主意，或者有些许资源无需分析，可以返回 defaultConfig
    return defaultConfig;
}