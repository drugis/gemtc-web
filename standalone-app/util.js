
module.exports = {
    fixProtocol: function fixProtocol(url) {
        if (!url) { return url; }
        const protocol = (process.env.GEMTC_HOST ? process.env.GEMTC_HOST.split('://')[0] : 'http') + '://';
        return protocol + url.split('://')[1];
    }
}