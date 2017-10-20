
## ProjectChooserModule

subscriptions
  - projectList -> [projectOverviewList]
  - projectChange -> [projectOverview]

request
  - projectChange -> [projectOverview]


actions

{
  type: 'projectList',
  payload: projectOverviewList
}
