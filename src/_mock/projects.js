import { faker } from '@faker-js/faker';

const fakeProjects = [
    {
        name: 'Lorem Epsun 12',
        description: 'this is a test project',
        longDescription: '',
        estimatedCost: 320,
        currency: '$',
        available: 280,
        createdAt: new Date(),
        endDate: new Date(2022, 8, 12),
        priority: 3,
        manager: 'Jhon'
    },
    {
        name: 'Lorem Epsun 12',
        description: 'this is a test project',
        longDescription: '',
        estimatedCost: 560,
        currency: '$',
        available: 214,
        createdAt: new Date(),
        endDate: new Date(2022, 8, 12),
        priority: 1,
        manager: 'Jhon'
    }
];
const projects = fakeProjects.map((proj, index) => {
    const setIndex = index + 1;

    return {
        id: faker.datatype.uuid(),
        ...proj
    };
});

export default projects;
