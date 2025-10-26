import { DateTime } from 'luxon'

const formatTime = (ISOString) => {
    if(!ISOString) return null;

    return DateTime
        .fromISO(ISOString, { zone: 'utc' })
        .setZone('Asia/Manila')
        .toFormat('h:mm a')
}

const timeHelper = {
    formatTime,
}

export default timeHelper;