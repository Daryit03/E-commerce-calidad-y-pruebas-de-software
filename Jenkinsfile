// Pipeline de integración y despliegue continuo
// E-commerce Electro Ferretero Darvin S.A.C. (sin Docker, Jenkins en Windows)
pipeline {
    agent any

    tools {
        nodejs 'Node22'   // Nombre registrado en Manage Jenkins > Tools
    }

    options {
        timestamps()                                    // Hora en cada línea del registro
        disableConcurrentBuilds()                       // Una ejecución a la vez
        timeout(time: 30, unit: 'MINUTES')              // Corta ejecuciones colgadas
        buildDiscarder(logRotator(numToKeepStr: '15'))  // Guarda las últimas 15
    }

    triggers {
        pollSCM('H/5 * * * *')   // Revisa GitHub cada 5 minutos
    }

    environment {
        CI = 'true'
        CORREOS_EQUIPO = 'darvinzelada@gmail.com, abrahamrequena18@gmail.com'   // Cambiar por los correos del equipo
    }

    stages {
        stage('Verificar entorno') {
            steps {
                bat 'node -v && npm -v && git log -1 --oneline'
            }
        }

        stage('Instalar dependencias') {
            parallel {
                stage('Backend') {
                    steps { dir('backend') { bat 'npm ci' } }
                }
                stage('Frontend') {
                    steps { dir('frontend') { bat 'npm ci' } }
                }
            }
        }

        stage('Generar cliente Prisma') {
            steps { dir('backend') { bat 'npx prisma generate' } }
        }

        stage('Análisis estático (ESLint)') {
            steps {
                dir('frontend') {
                    // Si ESLint encuentra errores, la ejecución queda en amarillo (UNSTABLE)
                    catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                        bat 'npm run lint'
                    }
                }
            }
        }

        stage('Pruebas backend (Jest)') {
            environment {
                // Valores solo para pruebas: no son los de producción
                JWT_SECRET             = 'clave-solo-para-pruebas'
                DATABASE_URL           = 'postgresql://localhost:5432/pruebas'
                JEST_JUNIT_OUTPUT_DIR  = 'reports'
                JEST_JUNIT_OUTPUT_NAME = 'junit-backend.xml'
            }
            steps {
                dir('backend') {
                    bat 'npx jest --ci --reporters=default --reporters=jest-junit'
                }
            }
        }

        stage('Compilar frontend (Vite)') {
            steps {
                dir('frontend') { bat 'npm run build' }
                archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
            }
        }

        stage('Desplegar') {
            when {
                expression { currentBuild.currentResult != 'FAILURE' }
            }
            steps {
                withCredentials([
                    string(credentialsId: 'render-deploy-hook', variable: 'RENDER_HOOK'),
                    string(credentialsId: 'vercel-deploy-hook', variable: 'VERCEL_HOOK')
                ]) {
                    bat 'curl.exe -fsS -X POST "%RENDER_HOOK%"'
                    bat 'curl.exe -fsS -X POST "%VERCEL_HOOK%"'
                }
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'backend/reports/junit-backend.xml'
        }
        failure {
            emailext to: "${env.CORREOS_EQUIPO}",
                     subject: "FALLÓ: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                     body: "La ejecución #${env.BUILD_NUMBER} falló.\nRevisar: ${env.BUILD_URL}console"
        }
        unstable {
            emailext to: "${env.CORREOS_EQUIPO}",
                     subject: "INESTABLE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                     body: "ESLint encontró problemas en el frontend.\nRevisar: ${env.BUILD_URL}console"
        }
        fixed {
            emailext to: "${env.CORREOS_EQUIPO}",
                     subject: "RECUPERADO: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                     body: "El pipeline vuelve a pasar correctamente.\n${env.BUILD_URL}"
        }
    }
}
