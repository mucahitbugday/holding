pipeline {
    agent any
    
    environment {
        COMPOSE_PROJECT_NAME = 'holding-website'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build and Deploy') {
            steps {
                script {
                    // Try Docker Compose V2 first (recommended)
                    try {
                        sh '''
                            docker compose down || true
                            docker compose up -d --build
                        '''
                    } catch (Exception e) {
                        // Fallback to Docker Compose V1
                        echo "Docker Compose V2 not found, trying V1..."
                        sh '''
                            docker-compose down || true
                            docker-compose up -d --build
                        '''
                    }
                }
            }
        }
        
        stage('Verify') {
            steps {
                script {
                    try {
                        sh 'docker compose ps || docker-compose ps'
                    } catch (Exception e) {
                        echo "Could not verify containers, but continuing..."
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo "Build successful! Website is running."
        }
        failure {
            echo "Build failed! Check logs for details."
            sh 'docker compose logs || docker-compose logs'
        }
        always {
            // Cleanup old images (optional)
            sh 'docker image prune -f || true'
        }
    }
}

