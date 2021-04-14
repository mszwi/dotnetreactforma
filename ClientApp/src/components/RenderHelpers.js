import { faQuestion, faVideo, faPhone, faComment } from '@fortawesome/free-solid-svg-icons'

export const contactMethodLabels = [
    'Velg',
    '\u00C9n til \u00E9n-video',
    'Telefon',
    '\u00C9n til \u00E9n-chat'
]

export function contactMethodsText(index) {
    return contactMethodLabels[index];
}

export const contactMethodIcons = [
    faQuestion,
    faVideo,
    faPhone,
    faComment
]

export function contactMethodsIcon(index) {
    return contactMethodIcons[index];
}


export default {
    contactMethodsIcon,
    contactMethodsText
}