import { AppDataSource, initializeDatabase, closeDatabase } from '../infrastructure/database/config';
import { QuestionService } from '../application/services/question.service';
import { Question } from '../domain/entities/question.entity';

async function run() {
  await initializeDatabase();
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  // Patch
  const originalTransaction = AppDataSource.transaction;
  AppDataSource.transaction = async function (cb: any) {
    return cb(queryRunner.manager);
  } as any;

  try {
    const service = new QuestionService();
    const result = await service.createQuestion({
      QuestionText: 'Test transaction rollback',
      Media: {
        Skill: 'LISTENING',
        Type: 'MULTIPLE_CHOICE',
        Section: '3',
        AudioUrl: '/test.mp3',
      },
      Choices: [
        { Content: 'A', Attribute: 'A', IsCorrect: true },
        { Content: 'B', Attribute: 'B', IsCorrect: false },
      ]
    }, 55);

    console.log('Created ID:', result.ID);

    const inDb = await queryRunner.manager.findOne(Question, { where: { ID: result.ID } });
    console.log('Found in DB before rollback:', inDb?.ID);

    await queryRunner.rollbackTransaction();

    const inDbAfter = await queryRunner.manager.findOne(Question, { where: { ID: result.ID } });
    console.log('Found in DB after rollback:', inDbAfter?.ID);
  } catch (err) {
    console.error(err);
    await queryRunner.rollbackTransaction();
  } finally {
    AppDataSource.transaction = originalTransaction;
    await queryRunner.release();
    await closeDatabase();
  }
}

run();
