package controllers

import (
	"Handbook/config"
	"Handbook/models"
	"log"
	"net/http"
	"regexp"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Регистрация пользователя
func RegisterUser(c *gin.Context) {
	var input struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
		Phone     string `json:"phone"`
		City      string `json:"city"`
		Password  string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные: " + err.Error()})
		return
	}

	var existingUser models.User
	if err := config.DB.Where("email = ? OR phone = ?", input.Email, input.Phone).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Этот email или телефон уже используется"})
		return
	}

	if matched, _ := regexp.MatchString(`^\+7\d{10}$`, input.Phone); !matched {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат телефона! Используйте +7XXXXXXXXXX"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обработке пароля"})
		return
	}

	user := models.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		Phone:     input.Phone,
		City:      input.City,
		Password:  string(hashedPassword),
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при создании пользователя: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Регистрация успешна!"})
}

func LoginUser(c *gin.Context) {
	var input struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	var user models.User

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
		return
	}

	log.Println("Данные для входа:", input.Login)

	if err := config.DB.Where("email = ? OR phone = ?", input.Login, input.Login).First(&user).Error; err != nil {
		log.Println(" Пользователь не найден!")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверные учетные данные"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		log.Println(" Неверный пароль!")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверные учетные данные"})
		return
	}

	log.Println(" Вход успешен:", user.ID)
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user_id": user.ID,
	})
}

func GetProfile(c *gin.Context) {
	userIDStr := c.Query("user_id")
	if userIDStr == "" {
		log.Println(" Ошибка: user_id отсутствует")
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id обязателен"})
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		log.Println(" Ошибка: некорректный user_id", userIDStr)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный user_id"})
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		log.Println(" Ошибка: пользователь не найден, user_id =", userID)
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	log.Println(" Профиль загружен:", user)

	c.JSON(http.StatusOK, gin.H{
		"first_name": user.FirstName,
		"last_name":  user.LastName,
		"email":      user.Email,
		"phone":      user.Phone,
		"city":       user.City,
	})
}
func UpdateProfile(c *gin.Context) {
	var input struct {
		UserID    int     `json:"user_id"`
		FirstName *string `json:"first_name"`
		LastName  *string `json:"last_name"`
		Email     *string `json:"email"`
		Phone     *string `json:"phone"`
	}

	log.Println(" Получен запрос на обновление профиля")

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Println(" Ошибка парсинга JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
		return
	}

	log.Println(" Данные от клиента:", input)

	if input.UserID == 0 {
		log.Println(" Ошибка: user_id отсутствует или равен 0")
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id обязателен"})
		return
	}

	var user models.User
	if err := config.DB.First(&user, input.UserID).Error; err != nil {
		log.Println(" Ошибка: пользователь не найден, user_id =", input.UserID)
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	if input.FirstName != nil {
		user.FirstName = *input.FirstName
	}
	if input.LastName != nil {
		user.LastName = *input.LastName
	}
	if input.Email != nil {
		user.Email = *input.Email
	}
	if input.Phone != nil {
		user.Phone = *input.Phone
	}

	if err := config.DB.Save(&user).Error; err != nil {
		log.Println(" Ошибка обновления БД:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления профиля"})
		return
	}

	log.Println(" Профиль успешно обновлён:", user)
	c.JSON(http.StatusOK, gin.H{"message": "Профиль обновлён!"})
}
