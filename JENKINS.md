# Jenkins Build Configuration

## Jenkins Shell Komutu

Jenkins'te "Execute shell" build step'inde şu komutu kullanın:

### Seçenek 1: Docker Compose V2 (Önerilen)
```bash
docker compose up -d --build
```

### Seçenek 2: Docker Compose V1
```bash
docker-compose up -d --build
```

### Seçenek 3: Build Script Kullanımı
```bash
chmod +x jenkins-build.sh
./jenkins-build.sh
```

## Jenkins Pipeline (Jenkinsfile)

Alternatif olarak Jenkinsfile kullanabilirsiniz:

```groovy
pipeline {
    agent any
    
    stages {
        stage('Build and Deploy') {
            steps {
                script {
                    // Try Docker Compose V2 first
                    try {
                        sh 'docker compose up -d --build'
                    } catch (Exception e) {
                        // Fallback to V1
                        sh 'docker-compose up -d --build'
                    }
                }
            }
        }
    }
    
    post {
        always {
            sh 'docker compose ps || docker-compose ps'
        }
    }
}
```

## Gereksinimler

1. **Docker yüklü olmalı**
   ```bash
   docker --version
   ```

2. **Docker Compose yüklü olmalı**
   - V2: `docker compose version`
   - V1: `docker-compose --version`

3. **Jenkins kullanıcısı docker grubunda olmalı**
   ```bash
   sudo usermod -aG docker jenkins
   sudo systemctl restart jenkins
   ```

4. **Jenkins'e Docker socket erişimi**
   ```bash
   sudo chmod 666 /var/run/docker.sock
   # veya
   sudo usermod -aG docker jenkins
   ```

## Troubleshooting

### "docker-compose: not found" Hatası

**Çözüm 1:** Docker Compose V2 kullanın (tire olmadan)
```bash
docker compose up -d --build
```

**Çözüm 2:** Docker Compose V1'i yükleyin
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Çözüm 3:** Tam path kullanın
```bash
/usr/local/bin/docker-compose up -d --build
```

### Permission Denied Hatası

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Build Hatası

Logları kontrol edin:
```bash
docker compose logs
# veya
docker-compose logs
```

