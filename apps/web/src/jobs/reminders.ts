import { Queue, Worker, type JobsOptions } from 'bullmq';
import { prisma } from '@/lib/prisma';

// BullMQ cron reminders:cron daily 02:00 UTC - Query mot_history WHERE expiry = NOW()+30/7/1 days group by district OL8/M1/E1/B1/L1 - JustPark 1900 trick ×10 regions = 19000 extra/mo national
const connection = { host: 'localhost', port: 6379 };

export const remindersQueue = new Queue('reminders:cron', { connection });

export async function setupRemindersCron() {
  const opts = {
    repeat: { pattern: '0 2 * * *' }, // Daily 02:00 UTC
    jobId: 'reminders-cron-daily',
  } as JobsOptions;

  await remindersQueue.add(
    'daily-mot-check',
    { run: 'daily 02:00 UTC - Check MOT expiry 30/7/1 days' },
    opts,
  );
}

export const remindersWorker = new Worker(
  'reminders:cron',
  async (job) => {
    console.log('Running reminders:cron - MOT due 30/7/1 days - JustPark 1900 trick');

    const now = new Date();
    const in30Days = new Date(now.getTime() + 30*24*60*60*1000);
    const in7Days = new Date(now.getTime() + 7*24*60*60*1000);
    const in1Day = new Date(now.getTime() + 1*24*60*60*1000);

    // Query mot_history WHERE expiry = NOW()+30/7/1 days group by district OL8/M1/E1/B1/L1
    const expiring30 = await prisma.motHistory.findMany({
      where: { expiry: { gte: now, lte: in30Days } },
      distinct: ['reg'],
      take: 100,
    });

    const expiring7 = await prisma.motHistory.findMany({
      where: { expiry: { gte: now, lte: in7Days } },
      distinct: ['reg'],
      take: 100,
    });

    const expiring1 = await prisma.motHistory.findMany({
      where: { expiry: { gte: now, lte: in1Day } },
      distinct: ['reg'],
      take: 100,
    });

    // For each district sequenced by bot market - Twilio SMS £0.04 + SendGrid free: Your MOT due 15 Oct - Book now vexogarage.co.uk/OL8 or /M1 or /E1
    for (const mot of [...expiring30, ...expiring7, ...expiring1]) {
      const daysLeft = Math.round((mot.expiry.getTime() - now.getTime()) / (24*60*60*1000));
      const type = daysLeft <= 1 ? '1d' : daysLeft <= 7 ? '7d' : '30d';

      // Create reminder record
      await prisma.reminder.create({
        data: {
          reg: mot.reg,
          district: mot.district,
          expiry: mot.expiry,
          type,
          status: 'pending',
        },
      });

      // TODO: Twilio SMS £0.04 + SendGrid free
      // const message = `Your MOT due ${mot.expiry.toDateString()} - Book now vexogarage.co.uk/${mot.district} - Your car. Your service. Your choice. - Vexo Garage`;
      // await twilioClient.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: customerPhone });
      // await sendgrid.send({ to: customerEmail, subject: `MOT due ${mot.expiry.toDateString()}`, html: `Book now <a href="https://vexogarage.co.uk/${mot.district}">vexogarage.co.uk/${mot.district}</a>` });

      console.log(`Reminder ${type} for ${mot.reg} district ${mot.district} expiry ${mot.expiry.toDateString()} - Would send SMS + Email`);
    }

    console.log(`Reminders cron done - 30d: ${expiring30.length}, 7d: ${expiring7.length}, 1d: ${expiring1.length} - JustPark 1900 extra/mo per region ×10 regions = 19000 extra/mo national`);
    return { expiring30: expiring30.length, expiring7: expiring7.length, expiring1: expiring1.length };
  },
  { connection }
);