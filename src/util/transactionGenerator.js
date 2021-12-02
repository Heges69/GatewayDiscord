module.exports = () => {
    var alpha = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let text = ''
    for(let i = 0; i < 10; i++){
        text += alpha[Math.floor(Math.random() * alpha.length)];
    }
    return text;
}