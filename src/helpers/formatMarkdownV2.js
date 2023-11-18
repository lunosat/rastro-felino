const formatMarkdownV2 = (text) => {
    // Adicione duas barras invertidas antes dos caracteres especiais no MarkdownV2
    const escapeChars = ['[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    const escapedText = escapeChars.reduce((result, char) => result.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`), text);

    return escapedText;
};

export default formatMarkdownV2