module.exports = {
    IS_CSS      : /\.css(?:\?|$)/i,
    PARAM       : /^(.*\.(?:css|js))(.*)$/i,
    ABSOLUTE    : /^\/\/.|:\//,
    URL_OPERATOR: /[&?]{1,2}/
};