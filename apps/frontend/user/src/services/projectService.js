import { mockProject } from '../data/mockData'

const delay = (ms) => new Promise(res => setTimeout(res, ms))

export const projectService = {
  get: async () => {
    await delay(300)
    return mockProject
  }
}
