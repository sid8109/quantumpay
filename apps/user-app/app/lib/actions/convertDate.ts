const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
];

export default function convertDate(date: Date) {
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}