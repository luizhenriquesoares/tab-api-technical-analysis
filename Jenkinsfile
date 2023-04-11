pipeline {
    agent any 
    stages {
        stage('Build') { 
            steps {
                sh './build/docker-build.sh'
            }
        }
    }
}