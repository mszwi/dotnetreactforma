let styles = {
    black: '#000000',
    white: '#FFFFFF',
    darkBackground: '#3E3E3E',
    lightBackground: '#EAEAEA',
    primary: '#6BB644',
    secondary: '#FF6E40'
}

export function darkBackground() {
    return {
        backgroundColor: styles.darkBackground,
        color: styles.white
    }
}

export function blackBackground() {
    return {
        backgroundColor: styles.black,
        color: styles.white
    }
}

export function lightBackground() {
    return {
        backgroundColor: styles.lightBackground,
        color: styles.black
    }
} 

export function primaryBackground() {
    return {
        backgroundColor: styles.primary,
        color: styles.white
    }
} 

export function heading() {
    return {
        color: styles.primary
    }
}

export default {
    styles,
    darkBackground,
    lightBackground,
    primaryBackground,
    heading,
    blackBackground
}