import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const teacher = await prisma.teacher.upsert({
    where: { phone: '13800000000' },
    update: {
      name: '陈老师',
      schoolName: '某某大学',
      departmentName: '文学院',
    },
    create: {
      phone: '13800000000',
      name: '陈老师',
      schoolName: '某某大学',
      departmentName: '文学院',
      defaultAiCommentStyle: 'detailed_constructive',
    },
  });

  const courseClass = await prisma.courseClass.create({
    data: {
      teacherId: teacher.id,
      courseName: '大学语文',
      className: '2026 春 A 班',
      term: '2026 春',
      courseType: 'public',
      description: '公共课大班测试数据',
    },
  });

  const students = [
    { name: '张同学', studentNo: '20260001' },
    { name: '李同学', studentNo: '20260002' },
    { name: '王同学', studentNo: '20260003' },
  ];

  for (const item of students) {
    const student = await prisma.student.upsert({
      where: { studentNo: item.studentNo },
      update: { name: item.name },
      create: item,
    });

    await prisma.classStudent.upsert({
      where: {
        classId_studentId: {
          classId: courseClass.id,
          studentId: student.id,
        },
      },
      update: { status: 'active' },
      create: {
        classId: courseClass.id,
        studentId: student.id,
        displayClassName: '汉语言文学 1 班',
      },
    });
  }

  await prisma.courseClass.update({
    where: { id: courseClass.id },
    data: { studentCount: students.length },
  });

  console.log('Seed completed');
  console.log({
    teacherPhone: teacher.phone,
    teacherDevCode: '123456',
    classId: courseClass.id,
    studentNos: students.map((student) => student.studentNo),
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
