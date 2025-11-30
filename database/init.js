const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const initDatabase = async () => {
  try {
    await db.testConnection();
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      try {
        await db.query(statement);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error('Error executing statement:', error.message);
        }
      }
    }
    
    await addRoleColumnIfNotExists();
    await addBuildingIdToSpecialtiesIfNotExists();
    await addSpecialtyIdToRoomsIfNotExists();
    await removeFeeColumnFromBookingsIfExists();
    
    console.log('✅ Database schema đã được khởi tạo');
    
    await migrateToBuildingsAndRooms();
    
    // Đã bỏ seed dữ liệu mẫu - dữ liệu sẽ được tạo thủ công qua admin interface
    // await seedInitialData();
  } catch (error) {
    console.error('❌ Lỗi khởi tạo database:', error);
  }
};

const addRoleColumnIfNotExists = async () => {
  try {
    const columns = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'role'
    `);
    
    if (columns.length === 0) {
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(20) DEFAULT 'user'
      `);
      console.log('✅ Đã thêm cột role vào bảng users');
    } else {
      console.log('✅ Cột role đã tồn tại');
    }
  } catch (error) {
    console.error('❌ Lỗi kiểm tra/thêm cột role:', error.message);
  }
};

const addBuildingIdToSpecialtiesIfNotExists = async () => {
  try {
    const columns = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'specialties' 
      AND COLUMN_NAME = 'building_id'
    `);
    
    if (columns.length === 0) {
      await db.query(`
        ALTER TABLE specialties 
        ADD COLUMN building_id INT,
        ADD FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL
      `);
      console.log('✅ Đã thêm cột building_id vào bảng specialties');
    } else {
      console.log('✅ Cột building_id đã tồn tại');
    }
  } catch (error) {
    console.error('❌ Lỗi kiểm tra/thêm cột building_id:', error.message);
  }
};

const addSpecialtyIdToRoomsIfNotExists = async () => {
  try {
    const columns = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'rooms' 
      AND COLUMN_NAME = 'specialty_id'
    `);
    
    if (columns.length === 0) {
      await db.query(`
        ALTER TABLE rooms 
        ADD COLUMN specialty_id INT,
        ADD CONSTRAINT fk_room_specialty
        FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL
      `);
      console.log('✅ Đã thêm cột specialty_id vào bảng rooms');
    } else {
      console.log('✅ Cột specialty_id đã tồn tại trong bảng rooms');
    }
  } catch (error) {
    console.error('❌ Lỗi kiểm tra/thêm cột specialty_id vào rooms:', error.message);
  }
};

const removeFeeColumnFromBookingsIfExists = async () => {
  try {
    const columns = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'bookings' 
      AND COLUMN_NAME = 'fee'
    `);
    
    if (columns.length > 0) {
      await db.query(`
        ALTER TABLE bookings 
        DROP COLUMN fee
      `);
      console.log('✅ Đã xóa cột fee khỏi bảng bookings');
    } else {
      console.log('✅ Cột fee đã không tồn tại trong bảng bookings');
    }
  } catch (error) {
    console.error('❌ Lỗi xóa cột fee khỏi bookings:', error.message);
  }
};

const migrateToBuildingsAndRooms = async () => {
  try {
    // Kiểm tra xem bảng buildings đã tồn tại chưa
    const buildingsTable = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'buildings'
    `);
    
    if (buildingsTable.length === 0) {
      // Tạo bảng buildings nếu chưa có
      await db.query(`
        CREATE TABLE IF NOT EXISTS buildings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          address TEXT,
          description TEXT,
          floors INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Đã tạo bảng buildings');
    }

    // Kiểm tra xem cột building_id đã tồn tại trong rooms chưa
    const buildingIdColumn = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'rooms' 
      AND COLUMN_NAME = 'building_id'
    `);
    
    if (buildingIdColumn.length === 0) {
      // Thêm cột building_id vào rooms
      await db.query('ALTER TABLE rooms ADD COLUMN building_id INT');
      await db.query('ALTER TABLE rooms ADD FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE');
    }
    
    // Migrate dữ liệu từ building string sang building_id (nếu có phòng chưa có building_id)
    const roomsWithoutBuildingId = await db.query('SELECT DISTINCT building FROM rooms WHERE (building_id IS NULL OR building_id = 0) AND building IS NOT NULL');
    
    if (roomsWithoutBuildingId.length > 0) {
      for (const row of roomsWithoutBuildingId) {
        const buildingName = row.building;
        // Tạo building nếu chưa tồn tại
        let building = await db.query('SELECT id FROM buildings WHERE name = ?', [buildingName]);
        if (building.length === 0) {
          const result = await db.query('INSERT INTO buildings (name) VALUES (?)', [buildingName]);
          building = [{ id: result.insertId }];
        }
        
        // Cập nhật rooms với building_id
        await db.query('UPDATE rooms SET building_id = ? WHERE building = ? AND (building_id IS NULL OR building_id = 0)', [building[0].id, buildingName]);
      }
      
      console.log('✅ Đã migrate rooms sang sử dụng building_id');
    }

    // Kiểm tra xem cột room_id đã tồn tại trong doctors chưa
    const roomIdColumn = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'doctors' 
      AND COLUMN_NAME = 'room_id'
    `);
    
    if (roomIdColumn.length === 0) {
      await db.query('ALTER TABLE doctors ADD COLUMN room_id INT');
      await db.query('ALTER TABLE doctors ADD FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL');
      
      // Migrate doctors sang sử dụng room_id
      const allRooms = await db.query(`
        SELECT r.id, r.room_number, b.name as building 
        FROM rooms r 
        LEFT JOIN buildings b ON r.building_id = b.id
      `);
      const allDoctors = await db.query('SELECT id, room, building FROM doctors WHERE room IS NOT NULL');
      
      for (const doctor of allDoctors) {
        const room = allRooms.find(r => r.room_number === doctor.room && r.building === doctor.building);
        if (room) {
          await db.query('UPDATE doctors SET room_id = ? WHERE id = ?', [room.id, doctor.id]);
        }
      }
      
      console.log('✅ Đã migrate doctors sang sử dụng room_id');
    }
  } catch (error) {
    console.error('❌ Lỗi migrate:', error.message);
  }
};

const seedInitialData = async () => {
  try {
    let shouldSeedSpecialties = false;
    const specialties = await db.query('SELECT COUNT(*) as count FROM specialties');
    if (specialties[0].count === 0) {
      shouldSeedSpecialties = true;
    }

    if (shouldSeedSpecialties) {
      const specialtiesData = [
      ['Nội - Cơ Xương Khớp', 'Khám và điều trị các bệnh về cơ xương khớp', 'Đau xương, Đau và sưng tại các khớp, Cứng khớp buổi sáng'],
      ['Da Liễu', 'Khám và điều trị các bệnh về da', 'Nổi mẩn đỏ, Ngứa da, Mụn nhọt'],
      ['Dị Ứng - Miễn dịch', 'Khám và điều trị các bệnh dị ứng', 'Dị ứng thức ăn, Dị ứng thuốc, Viêm mũi dị ứng'],
      ['Nội - Hô Hấp', 'Khám và điều trị các bệnh về hô hấp', 'Ho kéo dài, Khó thở, Đau ngực'],
      ['Nội - Thận Tiết Niệu', 'Khám và điều trị các bệnh về thận', 'Tiểu buốt, Tiểu ra máu, Đau lưng']
    ];

    for (const [name, description, symptoms] of specialtiesData) {
      await db.query(
        'INSERT INTO specialties (name, description, symptoms) VALUES (?, ?, ?)',
        [name, description, symptoms]
      );
    }

    const insertedSpecialties = await db.query('SELECT id FROM specialties ORDER BY id');
    
    // Tạo building trước
    const buildingName = 'Nhà K1';
    let buildingId;
    const existingBuilding = await db.query('SELECT id FROM buildings WHERE name = ?', [buildingName]);
    if (existingBuilding.length === 0) {
      const buildingResult = await db.query(
        'INSERT INTO buildings (name) VALUES (?)',
        [buildingName]
      );
      buildingId = buildingResult.insertId;
    } else {
      buildingId = existingBuilding[0].id;
    }
    
    // Tạo rooms
    const roomsData = [
      ['P.428', buildingId, 4],
      ['P.408', buildingId, 4],
      ['P.306', buildingId, 3],
      ['P.606', buildingId, 6],
      ['P.505', buildingId, 5]
    ];

    const roomIds = [];
    for (const [roomNumber, buildingId, floor] of roomsData) {
      const existingRoom = await db.query(
        'SELECT id FROM rooms WHERE room_number = ? AND building_id = ?',
        [roomNumber, buildingId]
      );
      
      if (existingRoom.length === 0) {
        const result = await db.query(
          'INSERT INTO rooms (room_number, building_id, floor) VALUES (?, ?, ?)',
          [roomNumber, buildingId, floor]
        );
        roomIds.push(result.insertId);
      } else {
        roomIds.push(existingRoom[0].id);
      }
    }
    
    const doctorsData = [
      ['Đào Hùng Hạnh', 'TS. BS', insertedSpecialties[0].id, roomIds[0]],
      ['Lưu Tuyết', 'TS. BS', insertedSpecialties[1].id, roomIds[1]],
      ['Nghiêm Th', 'BSCK II', insertedSpecialties[2].id, roomIds[2]],
      ['Nghiêm Trung Dũng', 'TS. BS', insertedSpecialties[3].id, roomIds[3]],
      ['Nghiêm Văn Hùng', 'Ths. BS', insertedSpecialties[4].id, roomIds[4]]
    ];

    for (const [fullName, title, specialtyId, roomId] of doctorsData) {
      const existing = await db.query(
        'SELECT id FROM doctors WHERE full_name = ? AND specialty_id = ?',
        [fullName, specialtyId]
      );
      
      if (existing.length === 0) {
        await db.query(
          'INSERT INTO doctors (full_name, title, specialty_id, room_id) VALUES (?, ?, ?, ?)',
          [fullName, title, specialtyId, roomId]
        );
      }
    }

      const insertedDoctors = await db.query(`
        SELECT d.id, d.specialty_id, r.room_number as room, b.name as building 
        FROM doctors d 
        LEFT JOIN rooms r ON d.room_id = r.id 
        LEFT JOIN buildings b ON r.building_id = b.id 
        ORDER BY d.id
      `);
      
      const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 7; hour < 24; hour++) {
          for (let minute = 0; minute < 60; minute += 15) {
            const h = hour.toString().padStart(2, '0');
            const m = minute.toString().padStart(2, '0');
            slots.push(`${h}:${m}`);
          }
        }
        return slots;
      };
      const timeSlots = generateTimeSlots();

    const today = new Date();
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const appointmentDate = new Date(today);
      appointmentDate.setDate(today.getDate() + dayOffset);
      const dateStr = appointmentDate.toISOString().split('T')[0];
      
      for (const doctor of insertedDoctors) {
        for (const timeSlot of timeSlots) {
          const existing = await db.query(
            'SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND time_slot = ?',
            [doctor.id, dateStr, timeSlot]
          );
          
          if (existing.length === 0) {
            await db.query(
              'INSERT INTO appointments (doctor_id, specialty_id, date, time_slot, room, building, max_patients, current_patients) VALUES (?, ?, ?, ?, ?, ?, 20, 0)',
              [doctor.id, doctor.specialty_id, dateStr, timeSlot, doctor.room, doctor.building]
            );
          }
        }
      }
    }

      console.log('✅ Đã seed dữ liệu mẫu thành công (specialties, doctors, appointments)');
    } else {
      console.log('✅ Dữ liệu specialties đã tồn tại, chỉ seed appointments');
      await seedAppointments();
    }
  } catch (error) {
    console.error('❌ Lỗi seed dữ liệu:', error);
  }
};

const seedAppointments = async () => {
  try {
    const insertedDoctors = await db.query(`
      SELECT d.id, d.specialty_id, r.room_number as room, b.name as building 
      FROM doctors d 
      LEFT JOIN rooms r ON d.room_id = r.id 
      LEFT JOIN buildings b ON r.building_id = b.id 
      ORDER BY d.id
    `);
    
    if (insertedDoctors.length === 0) {
      console.log('⚠️ Không có doctors để seed appointments');
      return;
    }
    
    const generateTimeSlots = () => {
      const slots = [];
      for (let hour = 7; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const h = hour.toString().padStart(2, '0');
          const m = minute.toString().padStart(2, '0');
          slots.push(`${h}:${m}`);
        }
      }
      return slots;
    };
    const timeSlots = generateTimeSlots();

    const today = new Date();
    let createdCount = 0;
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const appointmentDate = new Date(today);
      appointmentDate.setDate(today.getDate() + dayOffset);
      const dateStr = appointmentDate.toISOString().split('T')[0];
      
      for (const doctor of insertedDoctors) {
        for (const timeSlot of timeSlots) {
          const existing = await db.query(
            'SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND time_slot = ?',
            [doctor.id, dateStr, timeSlot]
          );
          
          if (existing.length === 0) {
            await db.query(
              'INSERT INTO appointments (doctor_id, specialty_id, date, time_slot, room, building, max_patients, current_patients) VALUES (?, ?, ?, ?, ?, ?, 20, 0)',
              [doctor.id, doctor.specialty_id, dateStr, timeSlot, doctor.room, doctor.building]
            );
            createdCount++;
          }
        }
      }
    }
    
    console.log(`✅ Đã tạo ${createdCount} appointments cho 7 ngày tiếp theo`);
  } catch (error) {
    console.error('❌ Lỗi seed appointments:', error);
  }
};

module.exports = initDatabase;

