const cron = require('node-cron');
const db = require('./database');
const uuid = require('uuid');

// Default check every hour: '0 * * * *'
let task;
let currentSchedule = '0 * * * *';

function initScheduler() {
    // 1. Get Schedule
    const scheduleRow = db.prepare('SELECT value FROM config WHERE key = ?').get('sync_schedule');
    if (scheduleRow) currentSchedule = scheduleRow.value;

    console.log(`Initializing scheduler with schedule: ${currentSchedule}`);
    startTask(currentSchedule);
}

function startTask(schedule) {
    if (task) task.stop();

    task = cron.schedule(schedule, () => {
        // 2. Check Global Toggle at runtime
        const enabledRow = db.prepare('SELECT value FROM config WHERE key = ?').get('global_sync_enabled');
        const isEnabled = enabledRow ? enabledRow.value === 'true' : true; // Default true

        if (isEnabled) {
            console.log('Running scheduled sync check...');
            queueAllActive();
        } else {
            console.log('Skipping scheduled sync (Global Sync Disabled)');
        }
    });
    task.start();
}

function updateSchedule(newSchedule) {
    console.log(`Updating schedule to: ${newSchedule}`);
    currentSchedule = newSchedule;
    startTask(newSchedule);
}

function queueAllActive() {
    const items = db.prepare('SELECT id FROM sync_items WHERE active = 1').all();
    const now = new Date().toISOString();

    const insert = db.prepare('INSERT INTO jobs (id, type, sync_item_id, status, priority, created_at) VALUES (?, ?, ?, ?, ?, ?)');

    const transaction = db.transaction((items) => {
        for (const item of items) {
            insert.run(uuid.v4(), 'sync', item.id, 'queued', 0, now);
        }
    });

    transaction(items);
    console.log(`Queued ${items.length} sync jobs.`);
}

module.exports = { initScheduler, queueAllActive, updateSchedule };
