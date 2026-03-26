-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: db_do_an_tot_nghiep
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assessment`
--

DROP TABLE IF EXISTS `assessment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Version` int DEFAULT NULL,
  `IsActive` int DEFAULT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  `TypeID` int DEFAULT NULL,
  `TestID` int DEFAULT NULL,
  `MediaData` longblob,
  `ImageData` longblob,
  `Paragraphs` mediumtext,
  `Title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `_idx` (`TestID`),
  KEY `type_fk_idx` (`TypeID`),
  CONSTRAINT `TestID` FOREIGN KEY (`TestID`) REFERENCES `test` (`ID`),
  CONSTRAINT `type_fk` FOREIGN KEY (`TypeID`) REFERENCES `exercisetype` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assessmentanswer`
--

DROP TABLE IF EXISTS `assessmentanswer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessmentanswer` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `AssessmentAttemptID` int NOT NULL,
  `IsCorrect` bit(1) DEFAULT NULL,
  `assessmentOptionID` int NOT NULL,
  `assessmentQuestionID` int NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKPlacementA620340` (`AssessmentAttemptID`),
  KEY `assessmentOptionID_idx` (`assessmentOptionID`),
  KEY `assessmentQuestionID_idx` (`assessmentQuestionID`),
  CONSTRAINT `assessmentOptionID` FOREIGN KEY (`assessmentOptionID`) REFERENCES `assessmentoption` (`ID`),
  CONSTRAINT `assessmentQuestionID` FOREIGN KEY (`assessmentQuestionID`) REFERENCES `assessmentquestion` (`ID`),
  CONSTRAINT `FKPlacementA620340` FOREIGN KEY (`AssessmentAttemptID`) REFERENCES `assessmentattempt` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=465 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assessmentattempt`
--

DROP TABLE IF EXISTS `assessmentattempt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessmentattempt` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `StartedAt` datetime DEFAULT NULL,
  `SubmittedAt` datetime DEFAULT NULL,
  `Score` int DEFAULT NULL,
  `LevelMapped` int DEFAULT NULL,
  `assessmentID` int NOT NULL,
  `TestAtemptID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `assessmentattempt_ibfk_1` (`assessmentID`),
  KEY `testatemptid_fk_idx` (`TestAtemptID`),
  CONSTRAINT `assessmentattempt_ibfk_1` FOREIGN KEY (`assessmentID`) REFERENCES `assessment` (`ID`),
  CONSTRAINT `testatemptid_fk` FOREIGN KEY (`TestAtemptID`) REFERENCES `testattempt` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=199 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assessmentoption`
--

DROP TABLE IF EXISTS `assessmentoption`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessmentoption` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `AssessmentQuestionID` int NOT NULL,
  `Content` varchar(255) DEFAULT NULL,
  `IsCorrect` bit(1) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKPlacementC625771` (`AssessmentQuestionID`),
  CONSTRAINT `FKPlacementC625771` FOREIGN KEY (`AssessmentQuestionID`) REFERENCES `assessmentquestion` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=292 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assessmentquestion`
--

DROP TABLE IF EXISTS `assessmentquestion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessmentquestion` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `AssessmentID` int NOT NULL,
  `Section` varchar(255) DEFAULT NULL,
  `Stem` varchar(255) DEFAULT NULL,
  `MediaData` longblob,
  `ExplainText` mediumtext,
  PRIMARY KEY (`ID`),
  KEY `FKPlacementQ111816` (`AssessmentID`),
  CONSTRAINT `FKPlacementQ111816` FOREIGN KEY (`AssessmentID`) REFERENCES `assessment` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attempt`
--

DROP TABLE IF EXISTS `attempt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attempt` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `StudentProfileID` int NOT NULL,
  `ExamID` int DEFAULT NULL,
  `StartedAt` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `SubmittedAt` datetime DEFAULT NULL,
  `ScorePercent` int DEFAULT NULL,
  `ScoreReading` int DEFAULT NULL,
  `ScoreListening` int DEFAULT NULL,
  `ExerciseID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKAttempt228324` (`StudentProfileID`),
  KEY `fk_attempt_exercise` (`ExerciseID`),
  KEY `FK_735f262fc28c072ac9b4a3f37ee` (`ExamID`),
  CONSTRAINT `FK_735f262fc28c072ac9b4a3f37ee` FOREIGN KEY (`ExamID`) REFERENCES `exam` (`ID`),
  CONSTRAINT `fk_attempt_exercise` FOREIGN KEY (`ExerciseID`) REFERENCES `exercise` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FKAttempt228324` FOREIGN KEY (`StudentProfileID`) REFERENCES `studentprofile` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attemptanswer`
--

DROP TABLE IF EXISTS `attemptanswer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attemptanswer` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `AttemptID` int NOT NULL,
  `IsCorrect` bit(1) DEFAULT NULL,
  `QuestionID` int NOT NULL,
  `ChoiceID` int NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKAttemptAns688665` (`AttemptID`),
  KEY `FKAttemptAns407894` (`QuestionID`),
  KEY `FKAttemptAns352761` (`ChoiceID`),
  CONSTRAINT `FKAttemptAns352761` FOREIGN KEY (`ChoiceID`) REFERENCES `choice` (`ID`),
  CONSTRAINT `FKAttemptAns407894` FOREIGN KEY (`QuestionID`) REFERENCES `question` (`ID`),
  CONSTRAINT `FKAttemptAns688665` FOREIGN KEY (`AttemptID`) REFERENCES `attempt` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `choice`
--

DROP TABLE IF EXISTS `choice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `choice` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `QuestionID` int NOT NULL,
  `Content` varchar(255) DEFAULT NULL,
  `Attribute` varchar(255) DEFAULT NULL,
  `IsCorrect` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`ID`),
  KEY `FKChoice821980` (`QuestionID`),
  CONSTRAINT `FKChoice821980` FOREIGN KEY (`QuestionID`) REFERENCES `question` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1386 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `CreateAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `ParentId` int NOT NULL DEFAULT '0',
  `Status` int NOT NULL DEFAULT '1',
  `StudentProfileID` int NOT NULL,
  `ExamID` int NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_11367e59c4fdc66f53bcc8362da` (`StudentProfileID`),
  KEY `FK_f45a4cf4d1485beb0230eced7bd` (`ExamID`),
  CONSTRAINT `FK_11367e59c4fdc66f53bcc8362da` FOREIGN KEY (`StudentProfileID`) REFERENCES `studentprofile` (`ID`),
  CONSTRAINT `FK_f45a4cf4d1485beb0230eced7bd` FOREIGN KEY (`ExamID`) REFERENCES `exam` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `TrackID` int NOT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `Description` text,
  `LevelTag` int DEFAULT NULL,
  `IsPublished` int DEFAULT NULL,
  `TeacherID` int NOT NULL,
  `ImgData` longblob,
  `Type` varchar(45) DEFAULT 'MAIN',
  `Status` varchar(45) DEFAULT 'NEW',
  `Version` int DEFAULT '0',
  `ParentCourseID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKCourse378417` (`TrackID`),
  KEY `fk_course_teacherprofile` (`TeacherID`),
  KEY `parent_fk_idx` (`ParentCourseID`),
  CONSTRAINT `fk_course_teacherprofile` FOREIGN KEY (`TeacherID`) REFERENCES `teacherprofile` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FKCourse378417` FOREIGN KEY (`TrackID`) REFERENCES `track` (`ID`),
  CONSTRAINT `parent_fk` FOREIGN KEY (`ParentCourseID`) REFERENCES `course` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `definitionexample`
--

DROP TABLE IF EXISTS `definitionexample`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `definitionexample` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `PartOfSpeechID` int NOT NULL,
  `Definition` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `Example` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`ID`),
  KEY `fk_def_pos` (`PartOfSpeechID`),
  CONSTRAINT `fk_def_pos` FOREIGN KEY (`PartOfSpeechID`) REFERENCES `partofspeech` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dictionary`
--

DROP TABLE IF EXISTS `dictionary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dictionary` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Word` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Word` (`Word`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `enrollment`
--

DROP TABLE IF EXISTS `enrollment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollment` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `EnrolledAt` datetime DEFAULT NULL,
  `Status` int DEFAULT NULL,
  `StudentProfileID` int NOT NULL,
  `TrackID` int NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKEnrollment902962` (`StudentProfileID`),
  KEY `FKEnrollment86579` (`TrackID`),
  CONSTRAINT `FKEnrollment86579` FOREIGN KEY (`TrackID`) REFERENCES `track` (`ID`),
  CONSTRAINT `FKEnrollment902962` FOREIGN KEY (`StudentProfileID`) REFERENCES `studentprofile` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `enrollmentcourse`
--

DROP TABLE IF EXISTS `enrollmentcourse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollmentcourse` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `CourseID` int DEFAULT NULL,
  `EnrollmentID` int DEFAULT NULL,
  `status` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `course_fk_idx` (`CourseID`),
  KEY `enrollment_fk_idx` (`EnrollmentID`),
  CONSTRAINT `course_fk` FOREIGN KEY (`CourseID`) REFERENCES `course` (`ID`),
  CONSTRAINT `enrollment_fk` FOREIGN KEY (`EnrollmentID`) REFERENCES `enrollment` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exam`
--

DROP TABLE IF EXISTS `exam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `TimeCreate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `TimeExam` int NOT NULL,
  `Type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `UserID` int DEFAULT NULL,
  `ExamTypeID` int NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_1bdbde0c4b9e162f6e635a30f12` (`ExamTypeID`),
  CONSTRAINT `FK_1bdbde0c4b9e162f6e635a30f12` FOREIGN KEY (`ExamTypeID`) REFERENCES `examtype` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exam_question`
--

DROP TABLE IF EXISTS `exam_question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_question` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `ExamID` int NOT NULL,
  `QuestionID` int NOT NULL,
  `OrderIndex` int NOT NULL,
  `MediaQuestionID` int DEFAULT NULL,
  `IsGrouped` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  KEY `FK_89935bcb9e2356d031f2cc3e3af` (`ExamID`),
  KEY `FK_44b83b9337b143d21768669e63b` (`QuestionID`),
  CONSTRAINT `FK_44b83b9337b143d21768669e63b` FOREIGN KEY (`QuestionID`) REFERENCES `question` (`ID`),
  CONSTRAINT `FK_89935bcb9e2356d031f2cc3e3af` FOREIGN KEY (`ExamID`) REFERENCES `exam` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `examtype`
--

DROP TABLE IF EXISTS `examtype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examtype` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `IDX_5d7300c401a5bdbd33f66ccf39` (`Code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exercise`
--

DROP TABLE IF EXISTS `exercise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercise` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `LessonID` int DEFAULT NULL,
  `Type` varchar(255) DEFAULT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `Instruction` varchar(255) DEFAULT NULL,
  `OrderIndex` int DEFAULT NULL,
  `ExerciseTypeID` int NOT NULL,
  `UserID` int DEFAULT NULL,
  `MediaData` longblob,
  `ImageData` longblob,
  `Paragraphs` mediumtext,
  `ShowTime` time DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKExercise205531` (`LessonID`),
  KEY `FKExercise853432` (`ExerciseTypeID`),
  CONSTRAINT `FKExercise205531` FOREIGN KEY (`LessonID`) REFERENCES `lesson` (`ID`),
  CONSTRAINT `FKExercise853432` FOREIGN KEY (`ExerciseTypeID`) REFERENCES `exercisetype` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=289 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exercisetype`
--

DROP TABLE IF EXISTS `exercisetype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercisetype` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Code` varchar(255) DEFAULT NULL,
  `Description` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ID_UNIQUE` (`ID`),
  UNIQUE KEY `Code_UNIQUE` (`Code`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lesson`
--

DROP TABLE IF EXISTS `lesson`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `ModuleID` int NOT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `Summary` varchar(255) DEFAULT NULL,
  `DurationMinutes` int DEFAULT NULL,
  `OrderIndex` int DEFAULT NULL,
  `GatingRules` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKLesson896661` (`ModuleID`),
  CONSTRAINT `FKLesson896661` FOREIGN KEY (`ModuleID`) REFERENCES `module` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=201 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lessonprogress`
--

DROP TABLE IF EXISTS `lessonprogress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessonprogress` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `StudentProfileID` int NOT NULL,
  `LessonID` int NOT NULL,
  `PercentageWatched` int DEFAULT NULL,
  `Process` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKLessonProg343866` (`LessonID`),
  KEY `FKLessonProg793747` (`StudentProfileID`),
  CONSTRAINT `FKLessonProg343866` FOREIGN KEY (`LessonID`) REFERENCES `lesson` (`ID`),
  CONSTRAINT `FKLessonProg793747` FOREIGN KEY (`StudentProfileID`) REFERENCES `studentprofile` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `material`
--

DROP TABLE IF EXISTS `material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `LessonID` int NOT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `Type` varchar(255) DEFAULT NULL,
  `Url` varchar(255) DEFAULT NULL,
  `MaterialData` longblob,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKMaterial507421` (`LessonID`),
  CONSTRAINT `FKMaterial507421` FOREIGN KEY (`LessonID`) REFERENCES `lesson` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=209 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mediaasset`
--

DROP TABLE IF EXISTS `mediaasset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mediaasset` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `LessonID` int NOT NULL,
  `Type` varchar(255) DEFAULT NULL,
  `Url` varchar(255) DEFAULT NULL,
  `LengthSec` int DEFAULT NULL,
  `TranscriptUrl` varchar(255) DEFAULT NULL,
  `MediaData` longblob,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKMediaAsset572558` (`LessonID`),
  CONSTRAINT `FKMediaAsset572558` FOREIGN KEY (`LessonID`) REFERENCES `lesson` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=215 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mediaquestion`
--

DROP TABLE IF EXISTS `mediaquestion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mediaquestion` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Skill` varchar(255) DEFAULT NULL,
  `Type` varchar(255) NOT NULL,
  `Section` varchar(255) DEFAULT NULL,
  `AudioUrl` varchar(255) DEFAULT NULL,
  `ImageUrl` varchar(255) DEFAULT NULL,
  `Scirpt` varchar(1000) DEFAULT NULL,
  `mediaData` longblob,
  `GroupTitle` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `GroupDescription` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Difficulty` enum('EASY','MEDIUM','HARD') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `Tags` json DEFAULT NULL,
  `OrderIndex` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `module`
--

DROP TABLE IF EXISTS `module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `CourseID` int NOT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `Description` text,
  `OrderIndex` int DEFAULT NULL,
  `Score` int DEFAULT NULL,
  `type` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKModule365712` (`CourseID`),
  CONSTRAINT `FKModule365712` FOREIGN KEY (`CourseID`) REFERENCES `course` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `partofspeech`
--

DROP TABLE IF EXISTS `partofspeech`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partofspeech` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `DictionaryID` int NOT NULL,
  `PartOfSpeech` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ipa` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Audio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `fk_pos_dictionary` (`DictionaryID`),
  CONSTRAINT `fk_pos_dictionary` FOREIGN KEY (`DictionaryID`) REFERENCES `dictionary` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `QuestionText` varchar(255) DEFAULT NULL,
  `UserID` int DEFAULT NULL,
  `ExerciseID` int DEFAULT NULL,
  `ExamID` int DEFAULT NULL,
  `MediaQuestionID` int DEFAULT NULL,
  `Explain` longtext,
  `ShowTime` time DEFAULT NULL,
  `OrderInGroup` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`ID`),
  KEY `FKQuestion182104` (`ExamID`),
  KEY `FKQuestion776767` (`MediaQuestionID`),
  KEY `FKQuestion787291` (`ExerciseID`),
  CONSTRAINT `FKQuestion182104` FOREIGN KEY (`ExamID`) REFERENCES `exam` (`ID`),
  CONSTRAINT `FKQuestion776767` FOREIGN KEY (`MediaQuestionID`) REFERENCES `mediaquestion` (`ID`),
  CONSTRAINT `FKQuestion787291` FOREIGN KEY (`ExerciseID`) REFERENCES `exercise` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=377 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Value` varchar(255) DEFAULT NULL,
  `Description` text,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `studentdictionary`
--

DROP TABLE IF EXISTS `studentdictionary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `studentdictionary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `StudentProfileId` int NOT NULL,
  `DefinitionExampleId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_student_dictionary` (`StudentProfileId`),
  UNIQUE KEY `uq_student_definition` (`StudentProfileId`,`DefinitionExampleId`),
  KEY `defi_idx` (`DefinitionExampleId`),
  CONSTRAINT `defi` FOREIGN KEY (`DefinitionExampleId`) REFERENCES `definitionexample` (`ID`),
  CONSTRAINT `fk_sd_student` FOREIGN KEY (`StudentProfileId`) REFERENCES `studentprofile` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `studentprofile`
--

DROP TABLE IF EXISTS `studentprofile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `studentprofile` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `TargetScore` int DEFAULT NULL,
  `DailyStudyMinutes` int DEFAULT NULL,
  `GoalDate` datetime DEFAULT NULL,
  `PlacementLevel` varchar(255) DEFAULT NULL,
  `LastActiveAt` datetime DEFAULT NULL,
  `FirstLogin` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `FKStudentPro321519` (`UserID`),
  CONSTRAINT `FKStudentPro321519` FOREIGN KEY (`UserID`) REFERENCES `user` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `studyplan`
--

DROP TABLE IF EXISTS `studyplan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `studyplan` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `GeneratedAt` datetime DEFAULT NULL,
  `StartDate` date DEFAULT NULL,
  `ConfigJson` varchar(255) DEFAULT NULL,
  `Status` int DEFAULT NULL,
  `StudentProfileID` int NOT NULL,
  `TrackID` int DEFAULT NULL,
  `SoLuongNgayHoc` int DEFAULT NULL,
  `NgayHocTrongTuan` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKStudyPlan83084` (`StudentProfileID`),
  KEY `track_fk_idx` (`TrackID`),
  CONSTRAINT `FKStudyPlan83084` FOREIGN KEY (`StudentProfileID`) REFERENCES `studentprofile` (`ID`),
  CONSTRAINT `track_fk` FOREIGN KEY (`TrackID`) REFERENCES `track` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `studyplanitem`
--

DROP TABLE IF EXISTS `studyplanitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `studyplanitem` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Date` datetime DEFAULT NULL,
  `SlotIndex` int DEFAULT NULL,
  `Status` int DEFAULT NULL,
  `StudyPlanID` int NOT NULL,
  `LessonID` int DEFAULT NULL,
  `TestID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKStudyPlanI876048` (`StudyPlanID`),
  KEY `test_fk_idx` (`TestID`),
  KEY `FKStudyPlanI247352` (`LessonID`),
  CONSTRAINT `FKStudyPlanI247352` FOREIGN KEY (`LessonID`) REFERENCES `lesson` (`ID`),
  CONSTRAINT `FKStudyPlanI876048` FOREIGN KEY (`StudyPlanID`) REFERENCES `studyplan` (`ID`),
  CONSTRAINT `test_fk1` FOREIGN KEY (`TestID`) REFERENCES `test` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=249 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `teacherprofile`
--

DROP TABLE IF EXISTS `teacherprofile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacherprofile` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `Bio` varchar(255) DEFAULT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `OfficeHourStart` int DEFAULT NULL,
  `OfficeHourEnd` int DEFAULT NULL,
  `CCCD` varchar(255) DEFAULT NULL,
  `University` varchar(255) DEFAULT NULL,
  `GraduationYear` int DEFAULT NULL,
  `Major` varchar(255) DEFAULT NULL,
  `Degree` varchar(255) DEFAULT NULL,
  `TeachingExperience` varchar(255) DEFAULT NULL,
  `EnglishCertificate` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKTeacherPro837100` (`UserID`),
  CONSTRAINT `FKTeacherPro837100` FOREIGN KEY (`UserID`) REFERENCES `user` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `test`
--

DROP TABLE IF EXISTS `test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Type` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Name` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ModuleID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `ModuleID_idx` (`ModuleID`),
  KEY `_idx` (`ModuleID`),
  CONSTRAINT `ModuleID_idx` FOREIGN KEY (`ModuleID`) REFERENCES `module` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `testattempt`
--

DROP TABLE IF EXISTS `testattempt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testattempt` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `TotalScore` float NOT NULL,
  `Count` int DEFAULT NULL,
  `TestAt` datetime NOT NULL,
  `TestID` int NOT NULL,
  `StudentProfileID` int NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `TestID_idx` (`TestID`),
  KEY `StudentProfileID_idx` (`StudentProfileID`),
  CONSTRAINT `studentid-fk` FOREIGN KEY (`StudentProfileID`) REFERENCES `studentprofile` (`ID`),
  CONSTRAINT `testid_fk` FOREIGN KEY (`TestID`) REFERENCES `test` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `testprogress`
--

DROP TABLE IF EXISTS `testprogress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testprogress` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Process` int DEFAULT NULL,
  `TotalScore` float DEFAULT NULL,
  `TestId` int DEFAULT NULL,
  `StudentprofileID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `test_fk_idx` (`TestId`),
  KEY `student_fk_idx` (`StudentprofileID`),
  CONSTRAINT `student_fk` FOREIGN KEY (`StudentprofileID`) REFERENCES `studentprofile` (`ID`),
  CONSTRAINT `test_fk` FOREIGN KEY (`TestId`) REFERENCES `test` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `track`
--

DROP TABLE IF EXISTS `track`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `track` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Code` varchar(255) DEFAULT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Description` text,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Email` varchar(255) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `FullName` varchar(255) DEFAULT NULL,
  `Status` varchar(255) DEFAULT NULL,
  `CreateAt` datetime DEFAULT NULL,
  `Token` varchar(255) DEFAULT NULL,
  `Phone` varchar(255) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `Sex` varchar(255) DEFAULT NULL,
  `Birthday` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `IDX_b7eee57d84fb7ed872e660197f` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userrole`
--

DROP TABLE IF EXISTS `userrole`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userrole` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `AssignedAt` datetime DEFAULT NULL,
  `RoleID` int NOT NULL,
  `UserID` int NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FKUserRole886037` (`RoleID`),
  KEY `FKUserRole407442` (`UserID`),
  CONSTRAINT `FKUserRole407442` FOREIGN KEY (`UserID`) REFERENCES `user` (`ID`),
  CONSTRAINT `FKUserRole886037` FOREIGN KEY (`RoleID`) REFERENCES `role` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-16 21:56:35
