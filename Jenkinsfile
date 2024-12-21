pipeline {
    agent any // Run on any available agent

    environment {
        // Define environment variables
        PROJECT_ID = 'ikara-development' // Your Firebase project ID
        VERSION = ''
        GIT_BRANCH = ''
        PROJECT_ENV = '[DEV]'
    }

    stages {
        stage('Checkout latest source') {
            steps {
                // Checks out the source code
                git branch: 'develop',
                    credentialsId: 'longpp-bitbucket',
                    url: 'https://tools.ikara.co:9443/scm/ser/firebaseapi.git'
            }
        }

        stage('Send Slack Message Before Deploy') {
            steps {
                dir('F:/Jenkins/.jenkins/workspace/FirebaseFunction/functions') {
                    script {
                        withCredentials([string(credentialsId: 'Slack-token', variable: 'SLACK_TOKEN')]) {
                            sh 'git pull'
                            VERSION = sh(script: "node -p \"require('./package.json').version\"", returnStdout: true).trim()
                            GIT_BRANCH = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                            println("Git branch: ${GIT_BRANCH}")
                            def message = ""
                            if (GIT_BRANCH == 'master') {
                                message = "Start deploy Firebase Functions [PROD]: ${VERSION}"
                                PROJECT_ID = "ikara4m"
                                PROJECT_ENV = '[PROD]'
                            } else if (GIT_BRANCH == 'develop') {
                                message = "Start deploy Firebase Functions [DEV]: ${VERSION}"
                            } else if (GIT_BRANCH) {
                                message = "Message for other branch: '${env.BRANCH_NAME}'"
                            } else {
                                message = "Branch name is not available (null)."
                            }
                            slackSend(
                                channel: 'C07GRH3MF2R',
                                color: 'good',
                                message: message,
                                tokenCredentialId: 'Slack-token'
                            )
                        }
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('F:/Jenkins/.jenkins/workspace/FirebaseFunction/functions') {
                    script {
                        // Get name of changed files latest
                        def changeFiles = sh(script: "git diff HEAD ${GIT_BRANCH} --name-only", returnStdout: true).trim()
                        echo '${changeFiles}'
                        // Check if 'package.json' is in the list of changed files
                        def packageJsonChanged = changeFiles.contains('functions/package.json')

                        if (packageJsonChanged) {
                            echo 'Install project dependencies'
                            sh 'C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/npm install'   
                        } else {
                            echo 'package.json has not changed. Skip npm install'
                        }
                    }
                }
            }
        }

        stage('Deploy to Firebase') {
            steps {
                dir('F:/Jenkins/.jenkins/workspace/FirebaseFunction/functions') {
                    script {
                        def changeFilesApi = sh(script: "git diff --name-only HEAD~1 | awk -F'/' '{print \$3}' | uniq", returnStdout: true).trim()
                        def changeFilesGame = sh(script: "git diff --name-only HEAD~1 | awk -F'/' '{print \$4}' | uniq", returnStdout: true).trim()
                            // Check if 'package.json' is in the list of changed files
                        def v3Changed = changeFilesApi.contains('v3.ts')
                        def v4Changed = changeFilesApi.contains('v4.ts')
                        def v5Changed = changeFilesApi.contains('v5.ts')
                        def v6Changed = changeFilesApi.contains('v6.ts')
                        def v7Changed = changeFilesApi.contains('v7.ts')
                        def v8Changed = changeFilesApi.contains('v8.ts')
                        def v9Changed = changeFilesApi.contains('v9.ts')
                        def v10Changed = changeFilesApi.contains('v10.ts')
                        def v11Changed = changeFilesApi.contains('v11.ts')
                        def v12Changed = changeFilesApi.contains('v12.ts')
                        def v13Changed = changeFilesApi.contains('v13.ts')
                        def v14Changed = changeFilesApi.contains('v14.ts')
                        
                        def g1Changed = changeFilesGame.contains('v1.ts')
                        def g2Changed = changeFilesGame.contains('v2.ts')
                        def g3Changed = changeFilesGame.contains('v3.ts')

                        if (v3Changed) {
                                echo 'Deploy api v3'
                                sh "C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/firebase deploy --only functions:v3 --project ${env.PROJECT_ID} --force" 
                        }
                        if (v4Changed) {
                                echo 'Deploy api v4'
                                sh "C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/firebase deploy --only functions:v4 --project ${env.PROJECT_ID} --force" 
                        }
                        if (v5Changed) {
                                echo 'Deploy api v5'
                                sh "C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/firebase deploy --only functions:v5 --project ${env.PROJECT_ID} --force" 
                        }
                        if (v6Changed) {
                                echo 'Deploy api v6'
                                sh "C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/firebase deploy --only functions:v6 --project ${env.PROJECT_ID} --force" 
                        }
                        if (v7Changed) {
                                echo 'Deploy api v7'
                                sh "C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/firebase deploy --only functions:v7 --project ${env.PROJECT_ID} --force" 
                        }
                        if (v8Changed) {
                                echo 'Deploy api v8'
                                sh "C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/firebase deploy --only functions:v8 --project ${env.PROJECT_ID} --force" 
                        }
                        if (v9Changed) {
                                echo 'Deploy api v9'
                                sh "C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/firebase deploy --only functions:v9 --project ${env.PROJECT_ID} --force" 
                        }
                        if (v10Changed) {
                                echo 'Deploy api v10'
                                sh "C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/firebase deploy --only functions:v10 --project ${env.PROJECT_ID} --force" 
                        }
                        if (v11Changed) {
                                echo 'Deploy api v11'
                                sh "C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/firebase deploy --only functions:v11 --project ${env.PROJECT_ID} --force" 
                        }
                        if (v12Changed) {
                                echo 'Deploy api v12'
                                sh "C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/firebase deploy --only functions:v12 --project ${env.PROJECT_ID} --force" 
                        }
                        if (v13Changed) {
                                echo 'Deploy api v13'
                                sh "C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/firebase deploy --only functions:v13 --project ${env.PROJECT_ID} --force" 
                        }
                        if (v14Changed) {
                                echo 'Deploy api v14'
                                sh "C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/firebase deploy --only functions:v14 --project ${env.PROJECT_ID} --force" 
                        }

                        // Deploy game API                    
                        if (g1Changed) {
                                echo 'Deploy Game v1'
                                sh "C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/firebase deploy --only functions:g1 --project ${env.PROJECT_ID} --force" 
                        }
                        if (g2Changed) {
                                echo 'Deploy Game v2'
                                sh "C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/firebase deploy --only functions:g2 --project ${env.PROJECT_ID} --force" 
                        }
                        if (g3Changed) {
                                echo 'Deploy Game v3'
                                sh "C:/Users/Administrator/AppData/Roaming/nvm/v20.11.1/firebase deploy --only functions:g3 --project ${env.PROJECT_ID} --force" 
                        }

                        // Deploy to Firebase using the Firebase CLI
                        
                    }
                }
            }
        }
    }

    post {
        success {
            script {
                    withCredentials([string(credentialsId: 'Slack-token', variable: 'SLACK_TOKEN')]) {
                        message = "Deploy Firebase functions successfuly ${PROJECT_ENV} : ${VERSION}"
                        slackSend(
                            channel: 'C07GRH3MF2R',
                            color: 'good',
                            message: message,
                            tokenCredentialId: 'Slack-token'
                        )
                    }
                }
            echo 'Deployment successful!'
        }
        failure {
            script {
                    withCredentials([string(credentialsId: 'Slack-token', variable: 'SLACK_TOKEN')]) {
                        message = "Deploy Firebase functions failed ${PROJECT_ENV} : ${VERSION}"
                        slackSend(
                            channel: 'C07GRH3MF2R',
                            color: 'bad',
                            message: message,
                            tokenCredentialId: 'Slack-token'
                        )
                    }
                }
            echo 'Deployment failed.'
        }
    }
}