// src/services/activityService.js

import { api } from './api'

const normalizeActivity = (activity) => ({
    ...activity,

    id: String(activity.id),

    // Backend → frontend field names
    studentId: activity.student_id,
    activityName: activity.activity_name,

    startTime: activity.start_time,
    endTime: activity.end_time,

    extendedEndTime:
        activity.extended_until ||
        activity.extended_end_time ||
        null,

    extensionReason:
        activity.extension_reason ||
        null,

    // Keep date available for calendar filtering
    date: activity.start_time
        ? new Date(activity.start_time).toISOString().split('T')[0]
        : activity.date,

    status: activity.status || 'PLANNED',

    progress: Number(activity.progress || 0),
})

export const activityService = {

    // GET /api/activities
    getAll: async () => {
        const response = await api.get('/activities')

        return (response.data || []).map(normalizeActivity)
    },

    // GET /api/activities?date=YYYY-MM-DD
    getByDate: async (dateStr) => {
        const response = await api.get(
            `/activities?date=${encodeURIComponent(dateStr)}`
        )

        return (response.data || []).map(normalizeActivity)
    },

    // GET /api/activities?start_date=...&end_date=...
    getByDateRange: async (startDate, endDate) => {
        const response = await api.get(
            `/activities?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`
        )

        return (response.data || []).map(normalizeActivity)
    },

    // POST /api/activities
    create: async (data) => {
        const payload = {
            student_id: data.student_id || data.studentId,
            activity_name: data.activity_name || data.activityName,
            description: data.description || '',
            start_time: data.start_time || data.startTime,
            end_time: data.end_time || data.endTime,
            status: data.status || 'PLANNED',
            progress: Number(data.progress ?? 0),
            date:
                data.date ||
                new Date().toISOString().split('T')[0],
        }

        const response = await api.post('/activities', payload)

        return normalizeActivity(response.data)
    },

    // PUT /api/activities/:id
    update: async (id, updates) => {
        const payload = {}

        if (
            updates.activity_name !== undefined ||
            updates.activityName !== undefined
        ) {
            payload.activity_name =
                updates.activity_name ?? updates.activityName
        }

        if (updates.description !== undefined) {
            payload.description = updates.description
        }

        if (
            updates.start_time !== undefined ||
            updates.startTime !== undefined
        ) {
            payload.start_time =
                updates.start_time ?? updates.startTime
        }

        if (
            updates.end_time !== undefined ||
            updates.endTime !== undefined
        ) {
            payload.end_time =
                updates.end_time ?? updates.endTime
        }

        if (updates.status !== undefined) {
            payload.status = updates.status
        }

        if (updates.progress !== undefined) {
            payload.progress = Number(updates.progress)
        }

        const response = await api.put(
            `/activities/${encodeURIComponent(id)}`,
            payload
        )

        return normalizeActivity(response.data)
    },

    // PUT /api/activities/:id/progress
    updateProgress: async (id, progress, status) => {
        const payload = {
            progress: Number(progress),
        }

        if (status) {
            payload.status = status
        }

        const response = await api.put(
            `/activities/${encodeURIComponent(id)}/progress`,
            payload
        )

        return normalizeActivity(response.data)
    },

    // PUT /api/activities/:id/extend
    extendTime: async (id, extendedEndTime, reason) => {
        const payload = {
            extension_duration: Number(
                reason?.extension_duration ??
                reason?.extensionDuration ??
                0
            ),
            new_end_time: extendedEndTime,
        }

        const response = await api.put(
            `/activities/${encodeURIComponent(id)}/extend`,
            payload
        )

        return normalizeActivity(response.data)
    },

    // DELETE /api/activities/:id
    delete: async (id) => {
        await api.delete(
            `/activities/${encodeURIComponent(id)}`
        )
    },
}