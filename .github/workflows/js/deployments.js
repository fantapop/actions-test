async function createInProgressDeployment(helpers, options) {
  const { github, context } = helpers;
  const { buildId, sha, envName, url } = options;
  
  let deployment = await github.rest.repos.createDeployment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: sha,
    environment: envName,
    transient_environment: false,
    auto_merge: false,
    payload: {
      build_id: buildId,
    },
    required_contexts: [],
    production_environment: false,
  });

  await github.rest.repos.createDeploymentStatus({
    owner: context.repo.owner,
    repo: context.repo.repo,
    deployment_id: deployment.data.id,
    state: "in_progress",
    environment_url: url,
    auto_inactive: false,
  });

  return deployment.data.id;
}

async function finalizeDeployment(helpers, options) {
  const { github, context } = helpers;
  const { deploymentId, url, needsResults } = options;

  const results = needsResults;
  const resolvedResult = results.find(res => res !== "success") || "success";

  let deploymentState = "";
  if (resolvedResult === "success" || resolvedResult === "failure") {
    deploymentState = resolvedResult;
  } else {
    deploymentState = "inactive";
  }
  
  await github.rest.repos.createDeploymentStatus({
    owner: context.repo.owner,
    repo: context.repo.repo,
    deployment_id: deploymentId,
    state: deploymentState,
    environment_url: url,
    auto_inactive: false,
  });
}

module.exports = {
  createInProgressDeployment,
  finalizeDeployment,
};
