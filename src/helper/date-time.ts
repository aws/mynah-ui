/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

export const getTimeDiff = (differenceInMs: number, show?: {
    years?: boolean,
    months?: boolean,
    weeks?: boolean,
    days?: boolean,
    hours?: boolean,
    minutes?: boolean
} | 1 | 2 | 3 | 4 | 5 | 6, separator?: string): string => {
    // get total seconds for the difference
    let delta = Math.abs(differenceInMs) / 1000

    // calculate (and subtract) whole years
    const years = Math.floor(delta / (86_400 * 30 * 12))
    delta -= years * (86_400 * 30 * 12)

    // calculate (and subtract) whole months
    const months = Math.floor(delta / (86_400 * 30))
    delta -= months * (86_400 * 30)

    // calculate (and subtract) whole weeks
    const weeks = Math.floor(delta / (86_400 * 7))
    delta -= weeks * (86_400 * 7)

    // calculate (and subtract) whole days
    const days = Math.floor(delta / 86_400)
    delta -= days * 86_400

    // calculate (and subtract) whole hours
    const hours = Math.floor(delta / 3_600) % 24
    delta -= hours * 3_600

    // calculate (and subtract) whole minutes
    const minutes = Math.floor(delta / 60) % 60
    delta -= minutes * 60;

    const combined = [];
    if (years !== 0 && (!show || typeof show !== "object" || show.years !== false)) {
        combined.push(`${years > 1 ? years : "a"} year${years > 1 ? 's' : ''}`);
    }
    if (months !== 0 && (!show || typeof show !== "object" || show.months !== false)) {
        combined.push(`${months > 1 ? months : "a"} month${months > 1 ? 's' : ''}`);
    }
    if (weeks !== 0 && (!show || typeof show !== "object" || show.weeks !== false)) {
        combined.push(`${weeks > 1 ? weeks : "a"} week${weeks > 1 ? 's' : ''}`);
    }
    if (days !== 0 && (!show || typeof show !== "object" || show.days !== false)) {
        combined.push(`${days > 1 ? days : "a"} day${days > 1 ? 's' : ''}`);
    }
    if (hours !== 0 && (!show || typeof show !== "object" || show.hours !== false)) {
        combined.push(`${hours > 1 ? hours : "an"} hour${hours > 1 ? 's' : ''}`);
    }
    if (minutes !== 0 && (!show || typeof show !== "object" || show.minutes !== false)) {
        combined.push(`${minutes > 1 ? minutes : "a"} minute${minutes > 1 ? 's' : ''}`);
    }

    if (years + months + weeks + days + hours + minutes === 0) {
        return 'a minute'
    }

    if (show && typeof show === "number") {
        combined.splice(show, combined.length);
    }
    console.log(combined);
    return combined.join(separator ?? " ");
}
